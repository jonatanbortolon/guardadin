import { NextResponse } from "next/server";
import { jsonError } from "@/libs/api";
import { kysely } from "@/libs/kysely";

type Context = { params: Promise<{ token: string }> };

export async function GET(_request: Request, { params }: Context) {
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

	return NextResponse.json({ email: invite.email });
}
