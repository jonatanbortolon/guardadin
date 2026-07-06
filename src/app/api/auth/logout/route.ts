import { NextResponse } from "next/server";
import { destroySession } from "@/libs/auth";

export async function POST() {
	await destroySession();

	return NextResponse.json({ ok: true });
}
