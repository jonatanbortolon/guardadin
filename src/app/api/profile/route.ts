import { NextResponse } from "next/server";
import { jsonError } from "@/libs/api";
import { requireUser } from "@/libs/auth";
import { kysely } from "@/libs/kysely";
import { toPublicUser } from "@/libs/user";
import { updateProfileSchema } from "@/schemas/auth";
import { normalizePhone } from "@/utils/phone";

export async function PATCH(request: Request) {
	const user = await requireUser();

	if (user instanceof NextResponse) {
		return user;
	}

	const body = await request.json().catch(() => null);
	const validatedFields = updateProfileSchema.safeParse(body);

	if (!validatedFields.success) {
		return NextResponse.json(
			{ errors: validatedFields.error.flatten().fieldErrors },
			{ status: 422 },
		);
	}

	const { name, email } = validatedFields.data;
	const phone = normalizePhone(validatedFields.data.phone);

	const existingEmail = await kysely
		.selectFrom("users")
		.select("id")
		.where("email", "=", email)
		.where("id", "!=", user.id)
		.executeTakeFirst();

	if (existingEmail) {
		return NextResponse.json(
			{ errors: { email: ["E-mail já cadastrado"] } },
			{ status: 422 },
		);
	}

	const existingPhone = await kysely
		.selectFrom("users")
		.select("id")
		.where("phone", "=", phone)
		.where("id", "!=", user.id)
		.executeTakeFirst();

	if (existingPhone) {
		return NextResponse.json(
			{ errors: { phone: ["Telefone já cadastrado"] } },
			{ status: 422 },
		);
	}

	try {
		const updated = await kysely
			.updateTable("users")
			.returningAll()
			.where("id", "=", user.id)
			.set({ name, email, phone })
			.executeTakeFirstOrThrow();

		return NextResponse.json(toPublicUser(updated));
	} catch (error) {
		console.error(error);
		return jsonError("Tivemos um problema no servidor", 500);
	}
}
