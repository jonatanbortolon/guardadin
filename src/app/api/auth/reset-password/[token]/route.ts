import { NextResponse } from "next/server";
import { jsonError } from "@/libs/api";
import { kysely } from "@/libs/kysely";
import { hashPassword } from "@/libs/password";
import { resetPasswordSchema } from "@/schemas/auth";

type Context = { params: Promise<{ token: string }> };

async function findUserByToken(token: string) {
	if (!token) {
		return null;
	}

	const user = await kysely
		.selectFrom("users")
		.selectAll()
		.where("passwordResetToken", "=", token)
		.executeTakeFirst();

	if (
		!user?.passwordResetExpiresAt ||
		new Date(user.passwordResetExpiresAt) < new Date()
	) {
		return null;
	}

	return user;
}

export async function GET(_request: Request, { params }: Context) {
	const { token } = await params;
	const user = await findUserByToken(token);

	return NextResponse.json({ valid: Boolean(user) });
}

export async function POST(request: Request, { params }: Context) {
	const { token } = await params;

	const body = await request.json().catch(() => null);
	const validatedFields = resetPasswordSchema.safeParse(body);

	if (!validatedFields.success) {
		return NextResponse.json(
			{ errors: validatedFields.error.flatten().fieldErrors },
			{ status: 422 },
		);
	}

	const user = await findUserByToken(token);

	if (!user) {
		return jsonError("Link inválido ou expirado", 400);
	}

	const { password } = validatedFields.data;

	await kysely.transaction().execute(async (trx) => {
		await trx
			.updateTable("users")
			.set({
				passwordHash: await hashPassword(password),
				passwordResetToken: null,
				passwordResetExpiresAt: null,
			})
			.where("id", "=", user.id)
			.execute();

		await trx.deleteFrom("sessions").where("userId", "=", user.id).execute();
	});

	return NextResponse.json({ ok: true });
}
