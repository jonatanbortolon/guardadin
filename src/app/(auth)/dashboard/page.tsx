import { kysely } from "@/libs/kysely";
import { session } from "@/libs/session";
import { DashboardHome } from "@/page-components/dashboard";
import { endOfMonth, startOfMonth } from "date-fns";
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

	const montStartDate = startOfMonth(new Date());
	const montEndDate = endOfMonth(new Date());

	const totalMonthSpentNT = await ResultAsync.fromPromise(
		kysely
			.selectFrom("transactions")
			.select(({ fn }) => [fn.sum<number>("total").as("value")])
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
	const totalMonthSpent = totalMonthSpentNT.isErr()
		? 0
		: totalMonthSpentNT.value?.value || 0;

	const totalMonthReceivedNT = await ResultAsync.fromPromise(
		kysely
			.selectFrom("transactions")
			.select(({ fn }) => [fn.sum<number>("total").as("value")])
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
	const totalMonthReceived = totalMonthReceivedNT.isErr()
		? 0
		: totalMonthReceivedNT.value?.value || 0;

	const thisMonthSpentCategoriesNT = await ResultAsync.fromPromise(
		kysely
			.selectFrom("categories")
			.selectAll("categories")
			.innerJoin("transactions", "transactions.categoryId", "categories.id")
			.select(({ fn }) => [
				fn.sum<number>("transactions.total").as("totalSpent"),
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
			.select(({ fn }) => [fn.sum<number>("total").as("totalSpent")])
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

	return (
		<DashboardHome
			thisMonthSpent={totalMonthSpent}
			thisMonthReceived={totalMonthReceived}
			thisMonthSpentCategories={thisMonthSpentCategories}
			thisMonthSpentWithoutCategory={thisMonthSpentWithoutCategory}
		/>
	);
}
