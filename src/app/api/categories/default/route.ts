import { NextResponse } from "next/server";
import { requireUser } from "@/libs/auth";
import { kysely } from "@/libs/kysely";

export async function GET() {
	const auth = await requireUser();
	if (auth instanceof NextResponse) {
		return auth;
	}

	const defaultCategory = await kysely
		.selectFrom("categories")
		.selectAll()
		.where("isDefault", "=", true)
		.executeTakeFirst();

	return NextResponse.json(defaultCategory ?? null);
}
