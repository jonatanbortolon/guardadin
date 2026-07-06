import { NextResponse } from "next/server";
import { jsonError } from "@/libs/api";
import { requireUser } from "@/libs/auth";
import { kysely } from "@/libs/kysely";
import {
	buildOtpauthUrl,
	generateRecoveryCodes,
	generateTwoFactorSecret,
	hashRecoveryCodes,
	serializeRecoveryCodes,
} from "@/libs/two-factor";

export async function POST() {
	const user = await requireUser();

	if (user instanceof NextResponse) {
		return user;
	}

	if (user.twoFactorEnabled) {
		return jsonError("A autenticação em dois fatores já está ativada", 400);
	}

	const secret = await generateTwoFactorSecret();
	const recoveryCodes = generateRecoveryCodes();

	await kysely
		.updateTable("users")
		.set({
			twoFactorSecret: secret,
			twoFactorRecoveryCodes: serializeRecoveryCodes(
				hashRecoveryCodes(recoveryCodes),
			),
			twoFactorEnabled: false,
		})
		.where("id", "=", user.id)
		.execute();

	return NextResponse.json({
		secret,
		otpauthUrl: buildOtpauthUrl(secret, user.email),
		recoveryCodes,
	});
}
