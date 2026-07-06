import { NextResponse } from "next/server";
import type { Category } from "@/kysely/types/category";
import {
	jsonError,
	type ListResult,
	parsePagination,
	parseSort,
} from "@/libs/api";
import { requireUser, requireWritePermission } from "@/libs/auth";
import { kysely } from "@/libs/kysely";
import { createCategorySchema } from "@/schemas/create-category";

const SORTABLE = ["createdAt", "updatedAt", "name"] as const;

export async function GET(request: Request) {
	const auth = await requireUser();
	if (auth instanceof NextResponse) {
		return auth;
	}

	const { searchParams } = new URL(request.url);
	const { page, perPage, offset } = parsePagination(searchParams);
	const { column, direction } = parseSort(searchParams, SORTABLE, {
		column: "createdAt",
		direction: "desc",
	});
	const search = searchParams.get("q")?.trim();

	let query = kysely.selectFrom("categories");

	if (search) {
		query = query.where("name", "ilike", `%${search}%`);
	}

	const [rows, count] = await Promise.all([
		query
			.selectAll()
			.orderBy(column, direction)
			.limit(perPage)
			.offset(offset)
			.execute(),
		query
			.select(({ fn }) => fn.countAll<number>().as("count"))
			.executeTakeFirst(),
	]);

	const result: ListResult<Category> = {
		data: rows,
		total: Number(count?.count ?? 0),
		page,
		perPage,
	};

	return NextResponse.json(result);
}

export async function POST(request: Request) {
	const auth = await requireWritePermission();
	if (auth instanceof NextResponse) {
		return auth;
	}

	const body = await request.json().catch(() => null);
	const validatedFields = createCategorySchema.safeParse(body);

	if (!validatedFields.success) {
		return NextResponse.json(
			{ errors: validatedFields.error.flatten().fieldErrors },
			{ status: 422 },
		);
	}

	const { name, isDefault } = validatedFields.data;

	try {
		const created = await kysely.transaction().execute(async (trx) => {
			if (isDefault) {
				await trx
					.updateTable("categories")
					.set({ isDefault: false })
					.where("isDefault", "=", true)
					.execute();
			}

			return trx
				.insertInto("categories")
				.returningAll()
				.values({ name, isDefault })
				.executeTakeFirstOrThrow();
		});

		return NextResponse.json(created, { status: 201 });
	} catch (error) {
		console.error(error);
		return jsonError("Tivemos um problema no servidor", 500);
	}
}
