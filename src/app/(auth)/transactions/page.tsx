import { kysely } from "@/libs/kysely";
import { session } from "@/libs/session";
import { TransactionsHome } from "@/page-components/transactions";
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

	const transactionsNT = await ResultAsync.fromPromise(
		kysely
			.selectFrom("transactions")
			.selectAll()
			.where("userId", "=", user.id)
			.execute(),
		() => ({
			message: "Tivemos um problema no servidor",
		}),
	);
	const transactions = transactionsNT.isErr() ? [] : transactionsNT.value;

	const categoriesNT = await ResultAsync.fromPromise(
		kysely
			.selectFrom("categories")
			.selectAll()
			.where("userId", "=", user.id)
			.execute(),
		() => ({
			message: "Tivemos um problema no servidor",
		}),
	);
	const categories = categoriesNT.isErr() ? [] : categoriesNT.value;

	const bankAccountsNT = await ResultAsync.fromPromise(
		kysely
			.selectFrom("bank_accounts")
			.selectAll()
			.where("userId", "=", user.id)
			.execute(),
		() => ({
			message: "Tivemos um problema no servidor",
		}),
	);
	const bankAccounts = bankAccountsNT.isErr() ? [] : bankAccountsNT.value;

	return (
		<TransactionsHome
			transactions={transactions}
			categories={categories}
			bankAccounts={bankAccounts}
		/>
	);
}
