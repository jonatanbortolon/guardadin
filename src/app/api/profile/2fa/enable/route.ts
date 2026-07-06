import { NextResponse } from "next/server";
import { jsonError } from "@/libs/api";
import { requireUser } from "@/libs/auth";
import { kysely } from "@/libs/kysely";
import { verifyTwoFactorToken } from "@/libs/two-factor";
import { toPublicUser } from "@/libs/user";
import { twoFactorEnableSchema } from "@/schemas/auth";

export async function POST(request: Request) {
	const user = await requireUser();

	if (user instanceof NextResponse) {
		return user;
	}

	if (user.twoFactorEnabled) {
		return jsonError("A autenticação em dois fatores já está ativada", 400);
	}

	if (!user.twoFactorSecret) {
		return jsonError(
			"Inicie a configuração da autenticação em dois fatores",
			400,
		);
	}

	const body = await request.json().catch(() => null);
	const validatedFields = twoFactorEnableSchema.safeParse(body);

	if (!validatedFields.success) {
		return NextResponse.json(
			{ errors: validatedFields.error.flatten().fieldErrors },
			{ status: 422 },
		);
	}

	const valid = await verifyTwoFactorToken(
		user.twoFactorSecret,
		validatedFields.data.code,
	);

	if (!valid) {
		return NextResponse.json(
			{ errors: { code: ["Código inválido"] } },
			{ status: 422 },
		);
	}

	const updated = await kysely
		.updateTable("users")
		.set({ twoFactorEnabled: true })
		.where("id", "=", user.id)
		.returningAll()
		.executeTakeFirstOrThrow();

	return NextResponse.json(toPublicUser(updated));
}
