import { NextResponse } from "next/server";
import { jsonError } from "@/libs/api";
import { requireUser } from "@/libs/auth";
import { kysely } from "@/libs/kysely";
import {
	hashRecoveryCode,
	parseRecoveryCodes,
	verifyTwoFactorToken,
} from "@/libs/two-factor";
import { toPublicUser } from "@/libs/user";
import { twoFactorDisableSchema } from "@/schemas/auth";

export async function POST(request: Request) {
	const user = await requireUser();

	if (user instanceof NextResponse) {
		return user;
	}

	if (!user.twoFactorEnabled) {
		return jsonError("A autenticação em dois fatores não está ativada", 400);
	}

	const body = await request.json().catch(() => null);
	const validatedFields = twoFactorDisableSchema.safeParse(body);

	if (!validatedFields.success) {
		return NextResponse.json(
			{ errors: validatedFields.error.flatten().fieldErrors },
			{ status: 422 },
		);
	}

	const { code } = validatedFields.data;

	let valid = user.twoFactorSecret
		? await verifyTwoFactorToken(user.twoFactorSecret, code)
		: false;

	if (!valid) {
		const hashes = parseRecoveryCodes(user.twoFactorRecoveryCodes);
		valid = hashes.includes(hashRecoveryCode(code));
	}

	if (!valid) {
		return NextResponse.json(
			{ errors: { code: ["Código inválido"] } },
			{ status: 422 },
		);
	}

	const updated = await kysely
		.updateTable("users")
		.set({
			twoFactorEnabled: false,
			twoFactorSecret: null,
			twoFactorRecoveryCodes: null,
		})
		.where("id", "=", user.id)
		.returningAll()
		.executeTakeFirstOrThrow();

	return NextResponse.json(toPublicUser(updated));
}
