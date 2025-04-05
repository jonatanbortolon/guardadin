import { kysely } from "@/libs/kysely";
import { session } from "@/libs/session";
import BankAccountsHome from "@/page-components/bank-accounts";
import { ResultAsync } from "neverthrow";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
	title: "GuardaDin - Contas Bancárias",
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

	return <BankAccountsHome bankAccounts={bankAccounts} />;
}
