import { NextResponse } from "next/server";
import { type ListResult, parsePagination, parseSort } from "@/libs/api";
import { requireAdmin } from "@/libs/auth";
import { kysely } from "@/libs/kysely";
import type { PublicUser } from "@/libs/user";

const SORTABLE = ["createdAt", "updatedAt", "email", "name"] as const;

export async function GET(request: Request) {
	const admin = await requireAdmin();

	if (admin instanceof NextResponse) {
		return admin;
	}

	const { searchParams } = new URL(request.url);
	const { page, perPage, offset } = parsePagination(searchParams);
	const { column, direction } = parseSort(searchParams, SORTABLE, {
		column: "createdAt",
		direction: "desc",
	});
	const search = searchParams.get("q")?.trim();

	let query = kysely.selectFrom("users");

	if (search) {
		query = query.where((eb) =>
			eb.or([
				eb("email", "ilike", `%${search}%`),
				eb("name", "ilike", `%${search}%`),
			]),
		);
	}

	const [rows, count] = await Promise.all([
		query
			.select([
				"id",
				"email",
				"name",
				"phone",
				"isAdmin",
				"botAllowed",
				"permission",
				"emailConfirmedAt",
				"twoFactorEnabled",
				"createdAt",
				"updatedAt",
			])
			.orderBy(column, direction)
			.limit(perPage)
			.offset(offset)
			.execute(),
		query
			.select(({ fn }) => fn.countAll<number>().as("count"))
			.executeTakeFirst(),
	]);

	const result: ListResult<PublicUser> = {
		data: rows,
		total: Number(count?.count ?? 0),
		page,
		perPage,
	};

	return NextResponse.json(result);
}
