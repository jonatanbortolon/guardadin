import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { NextResponse } from "next/server";
import { jsonError } from "@/libs/api";
import { requireUser } from "@/libs/auth";
import { kysely } from "@/libs/kysely";

export async function GET() {
	const auth = await requireUser();
	if (auth instanceof NextResponse) {
		return auth;
	}

	try {
		const now = new Date();

		const monthStartDate = startOfMonth(now);
		const monthEndDate = endOfMonth(now);

		const nowLastMonth = subMonths(now, 1);
		const lastMonthStartDate = startOfMonth(nowLastMonth);
		const lastMonthEndDate = endOfMonth(nowLastMonth);

		const sumForType = (type: "INCOME" | "EXPENSE", from: Date, to: Date) =>
			kysely
				.selectFrom("transaction_payments")
				.innerJoin(
					"transactions",
					"transactions.id",
					"transaction_payments.transactionId",
				)
				.select(({ fn }) => [
					fn.sum<number | null>("transaction_payments.amount").as("value"),
				])
				.where(({ eb, and, between }) =>
					and([
						eb("transactions.type", "=", type),
						between("transaction_payments.dueAt", from, to),
					]),
				)
				.executeTakeFirst();

		const [
			thisMonthSpentRow,
			thisMonthReceivedRow,
			thisMonthSpentCategories,
			thisMonthSpentWithoutCategoryRow,
			thisMonthSpentBankAccounts,
			thisMonthSpentWithoutBankAccountRow,
			lastMonthSpentRow,
			lastMonthReceivedRow,
		] = await Promise.all([
			sumForType("EXPENSE", monthStartDate, monthEndDate),
			sumForType("INCOME", monthStartDate, monthEndDate),
			kysely
				.selectFrom("categories")
				.selectAll("categories")
				.innerJoin("transactions", "transactions.categoryId", "categories.id")
				.innerJoin(
					"transaction_payments",
					"transaction_payments.transactionId",
					"transactions.id",
				)
				.select(({ fn }) => [
					fn.sum<number | null>("transaction_payments.amount").as("totalSpent"),
				])
				.where(({ and, eb, between }) =>
					and([
						eb("transactions.type", "=", "EXPENSE"),
						between("transaction_payments.dueAt", monthStartDate, monthEndDate),
					]),
				)
				.groupBy("categories.id")
				.execute(),
			kysely
				.selectFrom("transaction_payments")
				.innerJoin(
					"transactions",
					"transactions.id",
					"transaction_payments.transactionId",
				)
				.select(({ fn }) => [
					fn.sum<number | null>("transaction_payments.amount").as("totalSpent"),
				])
				.where(({ and, eb, between }) =>
					and([
						eb("transactions.type", "=", "EXPENSE"),
						eb("transactions.categoryId", "is", null),
						between("transaction_payments.dueAt", monthStartDate, monthEndDate),
					]),
				)
				.executeTakeFirst(),
			kysely
				.selectFrom("bank_accounts")
				.selectAll("bank_accounts")
				.innerJoin(
					"transactions",
					"transactions.bankAccountId",
					"bank_accounts.id",
				)
				.innerJoin(
					"transaction_payments",
					"transaction_payments.transactionId",
					"transactions.id",
				)
				.select(({ fn }) => [
					fn.sum<number | null>("transaction_payments.amount").as("totalSpent"),
				])
				.where(({ and, eb, between }) =>
					and([
						eb("transactions.type", "=", "EXPENSE"),
						between("transaction_payments.dueAt", monthStartDate, monthEndDate),
					]),
				)
				.groupBy("bank_accounts.id")
				.execute(),
			kysely
				.selectFrom("transaction_payments")
				.innerJoin(
					"transactions",
					"transactions.id",
					"transaction_payments.transactionId",
				)
				.select(({ fn }) => [
					fn.sum<number | null>("transaction_payments.amount").as("totalSpent"),
				])
				.where(({ and, eb, between }) =>
					and([
						eb("transactions.type", "=", "EXPENSE"),
						eb("transactions.bankAccountId", "is", null),
						between("transaction_payments.dueAt", monthStartDate, monthEndDate),
					]),
				)
				.executeTakeFirst(),
			sumForType("EXPENSE", lastMonthStartDate, lastMonthEndDate),
			sumForType("INCOME", lastMonthStartDate, lastMonthEndDate),
		]);

		return NextResponse.json({
			thisMonthSpent: thisMonthSpentRow?.value || 0,
			thisMonthReceived: thisMonthReceivedRow?.value || 0,
			thisMonthSpentCategories,
			thisMonthSpentWithoutCategory:
				thisMonthSpentWithoutCategoryRow?.totalSpent || null,
			thisMonthSpentBankAccounts,
			thisMonthSpentWithoutBankAccount:
				thisMonthSpentWithoutBankAccountRow?.totalSpent || null,
			lastMonthSpent: lastMonthSpentRow?.value || 0,
			lastMonthReceived: lastMonthReceivedRow?.value || 0,
		});
	} catch (error) {
		console.error(error);
		return jsonError("Tivemos um problema no servidor", 500);
	}
}
