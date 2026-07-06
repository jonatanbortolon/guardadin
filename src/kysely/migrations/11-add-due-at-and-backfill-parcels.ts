import type { Kysely } from "kysely";
import type { Database } from "@/kysely/types";
import { buildInstallments } from "@/libs/installments";

export async function up(db: Kysely<Database>): Promise<void> {
	await db.schema
		.alterTable("transaction_payments")
		.addColumn("due_at", "timestamptz", (col) => col.notNull())
		.execute();

	// Receita passa a ser sempre uma única parcela.
	await db
		.updateTable("transactions")
		.set({ totalParcels: 1 })
		.where("type", "=", "INCOME")
		.execute();

	const transactions = await db
		.selectFrom("transactions")
		.select(["id", "total", "totalParcels", "boughtAt"])
		.execute();

	for (const transaction of transactions) {
		const installments = buildInstallments({
			total: Number(transaction.total),
			totalParcels: transaction.totalParcels,
			boughtAt: new Date(transaction.boughtAt),
		});

		await db
			.insertInto("transaction_payments")
			.values(
				installments.map((installment) => ({
					transactionId: transaction.id,
					parcelNumber: installment.parcelNumber,
					amount: installment.amount,
					dueAt: installment.dueAt,
				})),
			)
			.execute();
	}
}

export async function down(db: Kysely<Database>): Promise<void> {
	await db.deleteFrom("transaction_payments").execute();
	await db.schema
		.alterTable("transaction_payments")
		.dropColumn("due_at")
		.execute();
}
