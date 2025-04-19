import { GENERIC_ERROR_MESSAGE } from "@/consts/whatsapp/messages/generic-error";
import { kysely } from "@/libs/kysely";
import { whatsapp } from "@/libs/whatsapp";
import { formatPrice } from "@/utils/format-price";
import { tool } from "@langchain/core/tools";
import { endOfMonth, startOfMonth } from "date-fns";
import { ResultAsync } from "neverthrow";

export const monthSpentByBankAccountTool = tool(
	async (_args, { metadata }) => {
		const userId = metadata.userId;
		const phoneNumber = metadata.phoneNumber;

		const montStartDate = startOfMonth(new Date());
		const montEndDate = endOfMonth(new Date());

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
						eb("bank_accounts.userId", "=", userId),
						eb("transactions.userId", "=", userId),
						between("transactions.boughtAt", montStartDate, montEndDate),
					]),
				)
				.orderBy("totalSpent", "desc")
				.groupBy("bank_accounts.id")
				.execute(),
			console.error,
		);

		if (thisMonthSpentBankAccountsNT.isErr()) {
			console.log(
				"thisMonthSpentBankAccountsNT",
				thisMonthSpentBankAccountsNT.error,
			);
			await ResultAsync.fromPromise(
				kysely
					.insertInto("chat_histories")
					.values({
						userId,
						role: "assistant",
						text: { content: GENERIC_ERROR_MESSAGE },
					})
					.execute(),
				console.error,
			);

			await ResultAsync.fromPromise(
				whatsapp.sendMessage(phoneNumber, GENERIC_ERROR_MESSAGE),
				console.error,
			);

			return;
		}

		const thisMonthSpentBankAccounts = thisMonthSpentBankAccountsNT.value;

		const thisMonthSpentWithoutBankAccountNT = await ResultAsync.fromPromise(
			kysely
				.selectFrom("transactions")
				.select(({ fn }) => [fn.sum<number | null>("total").as("totalSpent")])
				.where(({ and, eb, between }) =>
					and([
						eb("userId", "=", userId),
						eb("bankAccountId", "is", null),
						between("boughtAt", montStartDate, montEndDate),
					]),
				)
				.executeTakeFirst(),
			console.error,
		);

		if (thisMonthSpentWithoutBankAccountNT.isErr()) {
			console.log(
				"thisMonthSpentWithoutBankAccountNT",
				thisMonthSpentWithoutBankAccountNT.error,
			);
			await ResultAsync.fromPromise(
				kysely
					.insertInto("chat_histories")
					.values({
						userId,
						role: "assistant",
						text: { content: GENERIC_ERROR_MESSAGE },
					})
					.execute(),
				console.error,
			);

			await ResultAsync.fromPromise(
				whatsapp.sendMessage(phoneNumber, GENERIC_ERROR_MESSAGE),
				console.error,
			);

			return;
		}

		const thisMonthSpentWithoutBankAccount =
			thisMonthSpentWithoutBankAccountNT.value;

		if (!thisMonthSpentWithoutBankAccount) {
			await ResultAsync.fromPromise(
				kysely
					.insertInto("chat_histories")
					.values({
						userId,
						role: "assistant",
						text: { content: GENERIC_ERROR_MESSAGE },
					})
					.execute(),
				console.error,
			);

			await ResultAsync.fromPromise(
				whatsapp.sendMessage(phoneNumber, GENERIC_ERROR_MESSAGE),
				console.error,
			);

			return;
		}

		const message = `🏷️ *Seus gastos por conta bancária*\n\n- Sem conta bancária: *${formatPrice(thisMonthSpentWithoutBankAccount.totalSpent || 0)}*\n\n${thisMonthSpentBankAccounts
			.map(({ name, totalSpent }, index) => {
				let position: number | string = index + 1;

				if (position === 1) {
					position = "🥇";
				}

				if (position === 2) {
					position = "🥈";
				}

				if (position === 3) {
					position = "🥉";
				}

				return `${position}${typeof position === "number" ? "." : ""} ${name}: *${formatPrice(totalSpent || 0)}*`;
			})
			.join("\n")}
    `;

		await ResultAsync.fromPromise(
			kysely
				.insertInto("chat_histories")
				.values({
					userId,
					role: "assistant",
					text: { content: message },
				})
				.execute(),
			console.error,
		);

		await ResultAsync.fromPromise(
			whatsapp.sendMessage(phoneNumber, message),
			console.error,
		);
	},
	{
		name: "month-spent-by-bank-account",
		description: "Get the monthly spent per bank account for the user.",
	},
);
