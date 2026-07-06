import { NextResponse } from "next/server";
import { jsonError } from "@/libs/api";
import { kysely } from "@/libs/kysely";

type Context = { params: Promise<{ token: string }> };

export async function POST(_request: Request, { params }: Context) {
	const { token } = await params;

	const user = await kysely
		.selectFrom("users")
		.selectAll()
		.where("emailConfirmationToken", "=", token)
		.executeTakeFirst();

	if (!user) {
		return jsonError("Token inválido ou já utilizado", 404);
	}

	await kysely
		.updateTable("users")
		.set({ emailConfirmedAt: new Date(), emailConfirmationToken: null })
		.where("id", "=", user.id)
		.execute();

	return NextResponse.json({ ok: true });
}
