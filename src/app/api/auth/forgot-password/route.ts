import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { resolveLocale } from "@/i18n/config";
import { kysely } from "@/libs/kysely";
import { sendPasswordResetEmail } from "@/libs/mailer";
import { forgotPasswordSchema } from "@/schemas/auth";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export async function POST(request: Request) {
	const body = await request.json().catch(() => null);
	const validatedFields = forgotPasswordSchema.safeParse(body);

	if (!validatedFields.success) {
		return NextResponse.json(
			{ errors: validatedFields.error.flatten().fieldErrors },
			{ status: 422 },
		);
	}

	const locale = resolveLocale(body?.locale);
	const { email } = validatedFields.data;

	const user = await kysely
		.selectFrom("users")
		.selectAll()
		.where("email", "=", email)
		.executeTakeFirst();

	if (user) {
		const token = randomBytes(32).toString("hex");

		await kysely
			.updateTable("users")
			.set({
				passwordResetToken: token,
				passwordResetExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
			})
			.where("id", "=", user.id)
			.execute();

		try {
			await sendPasswordResetEmail({
				to: email,
				name: user.name,
				token,
				locale,
			});
		} catch (error) {
			console.error(error);
		}
	}

	return NextResponse.json({ ok: true });
}
