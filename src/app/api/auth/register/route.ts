import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { UserPermission } from "@/enums/user-permission";
import { resolveLocale } from "@/i18n/config";
import { jsonError } from "@/libs/api";
import { kysely } from "@/libs/kysely";
import { sendConfirmationEmail } from "@/libs/mailer";
import { hashPassword } from "@/libs/password";
import { toPublicUser } from "@/libs/user";
import { registerSchema } from "@/schemas/auth";
import { normalizePhone } from "@/utils/phone";

async function usersExist() {
	const row = await kysely
		.selectFrom("users")
		.select(({ fn }) => fn.countAll<number>().as("count"))
		.executeTakeFirst();

	return Number(row?.count ?? 0) > 0;
}

export async function GET() {
	return NextResponse.json({ canBootstrap: !(await usersExist()) });
}

export async function POST(request: Request) {
	if (await usersExist()) {
		return jsonError(
			"O administrador já foi cadastrado. Solicite um convite.",
			403,
		);
	}

	const body = await request.json().catch(() => null);
	const validatedFields = registerSchema.safeParse(body);

	if (!validatedFields.success) {
		return NextResponse.json(
			{ errors: validatedFields.error.flatten().fieldErrors },
			{ status: 422 },
		);
	}

	const locale = resolveLocale(body?.locale);
	const { name, email, password } = validatedFields.data;
	const phone = normalizePhone(validatedFields.data.phone);
	const token = randomUUID();

	const existingPhone = await kysely
		.selectFrom("users")
		.select("id")
		.where("phone", "=", phone)
		.executeTakeFirst();

	if (existingPhone) {
		return NextResponse.json(
			{ errors: { phone: ["Telefone já cadastrado"] } },
			{ status: 422 },
		);
	}

	try {
		const user = await kysely
			.insertInto("users")
			.returningAll()
			.values({
				name,
				email,
				phone,
				passwordHash: await hashPassword(password),
				isAdmin: true,
				permission: UserPermission.ALL,
				emailConfirmationToken: token,
			})
			.executeTakeFirstOrThrow();

		await sendConfirmationEmail({ to: email, name, token, locale });

		return NextResponse.json(toPublicUser(user), { status: 201 });
	} catch (error) {
		console.error(error);
		return jsonError("Tivemos um problema no servidor", 500);
	}
}
