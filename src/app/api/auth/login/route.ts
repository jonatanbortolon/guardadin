import { NextResponse } from "next/server";
import { jsonError } from "@/libs/api";
import { createSession } from "@/libs/auth";
import { kysely } from "@/libs/kysely";
import { verifyPassword } from "@/libs/password";
import {
	hashRecoveryCode,
	parseRecoveryCodes,
	serializeRecoveryCodes,
	verifyTwoFactorToken,
} from "@/libs/two-factor";
import { toPublicUser } from "@/libs/user";
import { loginSchema } from "@/schemas/auth";

export async function POST(request: Request) {
	const body = await request.json().catch(() => null);
	const validatedFields = loginSchema.safeParse(body);

	if (!validatedFields.success) {
		return NextResponse.json(
			{ errors: validatedFields.error.flatten().fieldErrors },
			{ status: 422 },
		);
	}

	const { email, password, code, rememberMe } = validatedFields.data;

	const user = await kysely
		.selectFrom("users")
		.selectAll()
		.where("email", "=", email)
		.executeTakeFirst();

	if (!user || !(await verifyPassword(password, user.passwordHash))) {
		return jsonError("E-mail ou senha inválidos", 401);
	}

	if (!user.emailConfirmedAt) {
		return jsonError("Confirme seu e-mail antes de entrar", 403);
	}

	if (user.twoFactorEnabled) {
		const trimmed = code?.trim();

		if (!trimmed) {
			return NextResponse.json({ twoFactorRequired: true });
		}

		let valid = user.twoFactorSecret
			? await verifyTwoFactorToken(user.twoFactorSecret, trimmed)
			: false;

		if (!valid) {
			const hashes = parseRecoveryCodes(user.twoFactorRecoveryCodes);
			const providedHash = hashRecoveryCode(trimmed);

			if (hashes.includes(providedHash)) {
				valid = true;
				await kysely
					.updateTable("users")
					.set({
						twoFactorRecoveryCodes: serializeRecoveryCodes(
							hashes.filter((hash) => hash !== providedHash),
						),
					})
					.where("id", "=", user.id)
					.execute();
			}
		}

		if (!valid) {
			return NextResponse.json(
				{ errors: { code: ["Código inválido"] }, twoFactorRequired: true },
				{ status: 422 },
			);
		}
	}

	await createSession(user.id, rememberMe ?? false);

	return NextResponse.json(toPublicUser(user));
}
