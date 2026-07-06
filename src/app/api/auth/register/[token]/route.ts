import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { resolveLocale } from "@/i18n/config";
import { jsonError } from "@/libs/api";
import { kysely } from "@/libs/kysely";
import { sendConfirmationEmail } from "@/libs/mailer";
import { hashPassword } from "@/libs/password";
import { toPublicUser } from "@/libs/user";
import { registerInvitedSchema } from "@/schemas/auth";
import { normalizePhone } from "@/utils/phone";

type Context = { params: Promise<{ token: string }> };

export async function POST(request: Request, { params }: Context) {
	const { token } = await params;

	const invite = await kysely
		.selectFrom("invites")
		.selectAll()
		.where("token", "=", token)
		.executeTakeFirst();

	if (!invite) {
		return jsonError("Convite inválido", 404);
	}

	if (invite.usedAt) {
		return jsonError("Convite já utilizado", 410);
	}

	const body = await request.json().catch(() => null);
	const validatedFields = registerInvitedSchema.safeParse(body);

	if (!validatedFields.success) {
		return NextResponse.json(
			{ errors: validatedFields.error.flatten().fieldErrors },
			{ status: 422 },
		);
	}

	const locale = resolveLocale(body?.locale);
	const { name, password } = validatedFields.data;
	const phone = normalizePhone(validatedFields.data.phone);
	const email = invite.email;
	const confirmationToken = randomUUID();

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
		const user = await kysely.transaction().execute(async (trx) => {
			const created = await trx
				.insertInto("users")
				.returningAll()
				.values({
					name,
					email,
					phone,
					passwordHash: await hashPassword(password),
					isAdmin: false,
					permission: invite.permission,
					emailConfirmationToken: confirmationToken,
				})
				.executeTakeFirstOrThrow();

			await trx
				.updateTable("invites")
				.set({ usedAt: new Date() })
				.where("id", "=", invite.id)
				.execute();

			return created;
		});

		await sendConfirmationEmail({
			to: email,
			name,
			token: confirmationToken,
			locale,
		});

		return NextResponse.json(toPublicUser(user), { status: 201 });
	} catch (error) {
		console.error(error);
		return jsonError("Tivemos um problema no servidor", 500);
	}
}
