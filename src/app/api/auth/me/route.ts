import { NextResponse } from "next/server";
import { jsonError } from "@/libs/api";
import { touchSession } from "@/libs/auth";
import { toPublicUser } from "@/libs/user";

export async function GET() {
	const user = await touchSession();

	if (!user) {
		return jsonError("Não autenticado", 401);
	}

	return NextResponse.json(toPublicUser(user));
}
