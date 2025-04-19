import { kysely } from "@/libs/kysely";
import { session } from "@/libs/session";
import { DashboardHome } from "@/page-components/dashboard";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { ResultAsync } from "neverthrow";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
	title: "GuardaDin - Lançamentos",
};

export default async function Page() {
	const userNT = await ResultAsync.fromPromise(
		session.getUserSession(),
		() => ({
			message: "Tivemos um problema no servidor",
		}),
	);

	if (userNT.isErr()) {
		return redirect("/login");
	}

	const user = userNT.value;

	if (!user) {
		return redirect("/login");
	}

	const now = new Date();

	const montStartDate = startOfMonth(now);
	const montEndDate = endOfMonth(now);

	const totalThisMonthSpentNT = await ResultAsync.fromPromise(
		kysely
			.selectFrom("transactions")
			.select(({ fn }) => [fn.sum<number | null>("total").as("value")])
			.where(({ eb, and, between }) =>
				and([
					eb("userId", "=", user.id),
					eb("type", "=", "EXPENSE"),
					between("boughtAt", montStartDate, montEndDate),
				]),
			)
			.executeTakeFirst(),
		console.error,
	);
	const totalThisMonthSpent = totalThisMonthSpentNT.isErr()
		? 0
		: totalThisMonthSpentNT.value?.value || 0;

	const totalThisMonthReceivedNT = await ResultAsync.fromPromise(
		kysely
			.selectFrom("transactions")
			.select(({ fn }) => [fn.sum<number | null>("total").as("value")])
			.where(({ eb, and, between }) =>
				and([
					eb("userId", "=", user.id),
					eb("type", "=", "INCOME"),
					between("boughtAt", montStartDate, montEndDate),
				]),
			)
			.executeTakeFirst(),
		console.error,
	);
	const totalThisMonthReceived = totalThisMonthReceivedNT.isErr()
		? 0
		: totalThisMonthReceivedNT.value?.value || 0;

	const thisMonthSpentCategoriesNT = await ResultAsync.fromPromise(
		kysely
			.selectFrom("categories")
			.selectAll("categories")
			.innerJoin("transactions", "transactions.categoryId", "categories.id")
			.select(({ fn }) => [
				fn.sum<number | null>("transactions.total").as("totalSpent"),
			])
			.where(({ and, eb, between }) =>
				and([
					eb("categories.userId", "=", user.id),
					eb("transactions.userId", "=", user.id),
					between("transactions.boughtAt", montStartDate, montEndDate),
				]),
			)
			.groupBy("categories.id")
			.execute(),
		console.error,
	);
	const thisMonthSpentCategories = thisMonthSpentCategoriesNT.isErr()
		? []
		: thisMonthSpentCategoriesNT.value;

	const thisMonthSpentWithoutCategoryNT = await ResultAsync.fromPromise(
		kysely
			.selectFrom("transactions")
			.select(({ fn }) => [fn.sum<number | null>("total").as("totalSpent")])
			.where(({ and, eb, between }) =>
				and([
					eb("userId", "=", user.id),
					eb("categoryId", "is", null),
					between("boughtAt", montStartDate, montEndDate),
				]),
			)
			.executeTakeFirst(),
		console.error,
	);
	const thisMonthSpentWithoutCategory = thisMonthSpentWithoutCategoryNT.isErr()
		? 0
		: thisMonthSpentWithoutCategoryNT.value?.totalSpent || null;

	const thisMonthSpentBankAccountsNT = await ResultAsync.fromPromise(
		kysely
			.selectFrom("bank_accounts")
			.selectAll("bank_accounts")
			.innerJoin(
				"transactions",
				"transactions.bankAccountId",
				"bank_accounts.id",
			)
			.select(({ fn }) => [
				fn.sum<number | null>("transactions.total").as("totalSpent"),
			])
			.where(({ and, eb, between }) =>
				and([
					eb("bank_accounts.userId", "=", user.id),
					eb("transactions.userId", "=", user.id),
					between("transactions.boughtAt", montStartDate, montEndDate),
				]),
			)
			.groupBy("bank_accounts.id")
			.execute(),
		console.error,
	);
	const thisMonthSpentBankAccounts = thisMonthSpentBankAccountsNT.isErr()
		? []
		: thisMonthSpentBankAccountsNT.value;
	const thisMonthSpentWithoutBankAccountNT = await ResultAsync.fromPromise(
		kysely
			.selectFrom("transactions")
			.select(({ fn }) => [fn.sum<number | null>("total").as("totalSpent")])
			.where(({ and, eb, between }) =>
				and([
					eb("userId", "=", user.id),
					eb("bankAccountId", "is", null),
					between("boughtAt", montStartDate, montEndDate),
				]),
			)
			.executeTakeFirst(),
		console.error,
	);
	const thisMonthSpentWithoutBankAccount =
		thisMonthSpentWithoutBankAccountNT.isErr()
			? 0
			: thisMonthSpentWithoutBankAccountNT.value?.totalSpent || null;

	const nowLastMonth = subMonths(now, 1);

	const lastMontStartDate = startOfMonth(nowLastMonth);
	const lastMontEndDate = endOfMonth(nowLastMonth);

	const totalLastMonthSpentNT = await ResultAsync.fromPromise(
		kysely
			.selectFrom("transactions")
			.select(({ fn }) => [fn.sum<number | null>("total").as("value")])
			.where(({ eb, and, between }) =>
				and([
					eb("userId", "=", user.id),
					eb("type", "=", "EXPENSE"),
					between("boughtAt", lastMontStartDate, lastMontEndDate),
				]),
			)
			.executeTakeFirst(),
		console.error,
	);
	const totalLastMonthSpent = totalLastMonthSpentNT.isErr()
		? 0
		: totalLastMonthSpentNT.value?.value || 0;

	const totalLastMonthReceivedNT = await ResultAsync.fromPromise(
		kysely
			.selectFrom("transactions")
			.select(({ fn }) => [fn.sum<number | null>("total").as("value")])
			.where(({ eb, and, between }) =>
				and([
					eb("userId", "=", user.id),
					eb("type", "=", "INCOME"),
					between("boughtAt", lastMontStartDate, lastMontEndDate),
				]),
			)
			.executeTakeFirst(),
		console.error,
	);
	const totalLastMonthReceived = totalLastMonthReceivedNT.isErr()
		? 0
		: totalLastMonthReceivedNT.value?.value || 0;

	return (
		<DashboardHome
			thisMonthSpent={totalThisMonthSpent}
			thisMonthReceived={totalThisMonthReceived}
			thisMonthSpentCategories={thisMonthSpentCategories}
			thisMonthSpentWithoutCategory={thisMonthSpentWithoutCategory}
			thisMonthSpentBankAccounts={thisMonthSpentBankAccounts}
			thisMonthSpentWithoutBankAccount={thisMonthSpentWithoutBankAccount}
			lastMonthSpent={totalLastMonthSpent}
			lastMonthReceived={totalLastMonthReceived}
		/>
	);
}
