import { endOfDay, endOfMonth, startOfDay, startOfMonth } from "date-fns";
import { sql } from "kysely";
import { NextResponse } from "next/server";
import type { Transaction } from "@/kysely/types/transaction";
import type { TransactionPayment } from "@/kysely/types/transaction-payment";
import {
	jsonError,
	type ListResult,
	parseNumberList,
	parsePagination,
	parseSort,
} from "@/libs/api";
import { requireUser, requireWritePermission } from "@/libs/auth";
import { buildInstallments, normalizeParcels } from "@/libs/installments";
import { kysely } from "@/libs/kysely";
import { createTransactionSchema } from "@/schemas/create-transaction";

const SORTABLE = [
	"total",
	"totalParcels",
	"boughtAt",
	"createdAt",
	"updatedAt",
	"monthAmount",
	"dueDate",
] as const;

const SORT_REFS: Record<(typeof SORTABLE)[number], string> = {
	total: "transactions.total",
	totalParcels: "transactions.totalParcels",
	boughtAt: "transactions.boughtAt",
	createdAt: "transactions.createdAt",
	updatedAt: "transactions.updatedAt",
	monthAmount: "transaction_payments.amount",
	dueDate: "transaction_payments.dueAt",
};

export type TransactionWithParcels = Transaction & {
	monthAmount: number;
	monthParcelNumber: number;
	monthDueAt: Date;
	payments: TransactionPayment[];
};

export async function GET(request: Request) {
	const auth = await requireUser();
	if (auth instanceof NextResponse) {
		return auth;
	}

	const { searchParams } = new URL(request.url);
	const { page, perPage, offset } = parsePagination(searchParams);
	const { column, direction } = parseSort(searchParams, SORTABLE, {
		column: "boughtAt",
		direction: "desc",
	});
	const description = searchParams.get("description")?.trim();
	const categoryIds = parseNumberList(searchParams, "categoryId");
	const bankAccountIds = parseNumberList(searchParams, "bankAccountId");
	const type = searchParams.get("type");

	const now = new Date();
	const fromParam = searchParams.get("from");
	const toParam = searchParams.get("to");
	const fromBase = fromParam
		? new Date(`${fromParam}T00:00:00`)
		: startOfMonth(now);
	const toBase = toParam ? new Date(`${toParam}T00:00:00`) : endOfMonth(now);
	const rangeStart = startOfDay(
		Number.isNaN(fromBase.getTime()) ? startOfMonth(now) : fromBase,
	);
	const rangeEnd = endOfDay(
		Number.isNaN(toBase.getTime()) ? endOfMonth(now) : toBase,
	);

	let query = kysely
		.selectFrom("transactions")
		.innerJoin("transaction_payments", (join) =>
			join
				.onRef("transaction_payments.transactionId", "=", "transactions.id")
				.on("transaction_payments.dueAt", ">=", rangeStart)
				.on("transaction_payments.dueAt", "<=", rangeEnd),
		);

	if (description) {
		query = query.where(
			"transactions.description",
			"ilike",
			`%${description}%`,
		);
	}

	if (categoryIds.length) {
		query = query.where("transactions.categoryId", "in", categoryIds);
	}

	if (bankAccountIds.length) {
		query = query.where("transactions.bankAccountId", "in", bankAccountIds);
	}

	if (type === "INCOME" || type === "EXPENSE") {
		query = query.where("transactions.type", "=", type);
	}

	const [rows, count] = await Promise.all([
		query
			.selectAll("transactions")
			.select([
				"transaction_payments.amount as monthAmount",
				"transaction_payments.parcelNumber as monthParcelNumber",
				"transaction_payments.dueAt as monthDueAt",
			])
			.orderBy(sql.ref(SORT_REFS[column]), direction)
			.orderBy(sql.ref("transactions.id"), direction)
			.limit(perPage)
			.offset(offset)
			.execute(),
		query
			.select(({ fn }) => fn.countAll<number>().as("count"))
			.executeTakeFirst(),
	]);

	const ids = rows.map((row) => row.id);
	const payments = ids.length
		? await kysely
				.selectFrom("transaction_payments")
				.selectAll()
				.where("transactionId", "in", ids)
				.orderBy("parcelNumber", "asc")
				.execute()
		: [];

	const data: TransactionWithParcels[] = rows.map((row) => ({
		...row,
		payments: payments.filter((payment) => payment.transactionId === row.id),
	}));

	const result: ListResult<TransactionWithParcels> = {
		data,
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
	const validatedFields = createTransactionSchema.safeParse(body);

	if (!validatedFields.success) {
		return NextResponse.json(
			{ errors: validatedFields.error.flatten().fieldErrors },
			{ status: 422 },
		);
	}

	const data = validatedFields.data;
	const totalParcels = normalizeParcels(data.type, data.totalParcels);

	try {
		const created = await kysely.transaction().execute(async (trx) => {
			const transaction = await trx
				.insertInto("transactions")
				.returningAll()
				.values({
					description: data.description,
					total: data.total,
					totalParcels,
					type: data.type,
					boughtAt: data.boughtAt,
					categoryId: data.categoryId,
					bankAccountId: data.bankAccountId,
				})
				.executeTakeFirstOrThrow();

			await trx
				.insertInto("transaction_payments")
				.values(
					buildInstallments({
						total: data.total,
						totalParcels,
						boughtAt: data.boughtAt,
					}).map((installment) => ({
						transactionId: transaction.id,
						parcelNumber: installment.parcelNumber,
						amount: installment.amount,
						dueAt: installment.dueAt,
					})),
				)
				.execute();

			return transaction;
		});

		return NextResponse.json(created, { status: 201 });
	} catch (error) {
		console.error(error);
		return jsonError("Tivemos um problema no servidor", 500);
	}
}
