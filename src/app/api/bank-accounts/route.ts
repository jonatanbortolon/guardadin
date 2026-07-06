import { NextResponse } from "next/server";
import type { BankAccount } from "@/kysely/types/bank-account";
import {
	jsonError,
	type ListResult,
	parsePagination,
	parseSort,
} from "@/libs/api";
import { requireUser, requireWritePermission } from "@/libs/auth";
import { kysely } from "@/libs/kysely";
import { createBankAccountSchema } from "@/schemas/create-bank-account";

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

	let query = kysely.selectFrom("bank_accounts");

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

	const result: ListResult<BankAccount> = {
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
	const validatedFields = createBankAccountSchema.safeParse(body);

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
					.updateTable("bank_accounts")
					.set({ isDefault: false })
					.where("isDefault", "=", true)
					.execute();
			}

			return trx
				.insertInto("bank_accounts")
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
