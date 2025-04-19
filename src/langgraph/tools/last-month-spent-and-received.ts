import { GENERIC_ERROR_MESSAGE } from "@/consts/whatsapp/messages/generic-error";
import { kysely } from "@/libs/kysely";
import { whatsapp } from "@/libs/whatsapp";
import { formatPrice } from "@/utils/format-price";
import { tool } from "@langchain/core/tools";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { ResultAsync } from "neverthrow";

export const lastMonthSpentAndReceivedTool = tool(
	async (_args, { metadata }) => {
		const userId = metadata.userId;
		const phoneNumber = metadata.phoneNumber;

		const now = new Date();

		const nowLastMonth = subMonths(now, 1);

		const lastMontStartDate = startOfMonth(nowLastMonth);
		const lastMontEndDate = endOfMonth(nowLastMonth);

		const totalSpentNT = await ResultAsync.fromPromise(
			kysely
				.selectFrom("transactions")
				.select(({ fn }) => [fn.sum<number | null>("total").as("value")])
				.where(({ eb, and, between }) =>
					and([
						eb("userId", "=", userId),
						between("boughtAt", lastMontStartDate, lastMontEndDate),
					]),
				)
				.executeTakeFirst(),
			console.error,
		);

		if (totalSpentNT.isErr()) {
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

		const totalSpent = totalSpentNT.value;

		if (!totalSpent) {
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

		const totalReceivedNT = await ResultAsync.fromPromise(
			kysely
				.selectFrom("transactions")
				.select(({ fn }) => [fn.sum<number | null>("total").as("value")])
				.where(({ eb, and, between }) =>
					and([
						eb("userId", "=", userId),
						between("boughtAt", lastMontStartDate, lastMontEndDate),
						eb("type", "=", "INCOME"),
					]),
				)
				.executeTakeFirst(),
			console.error,
		);

		if (totalReceivedNT.isErr()) {
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

		const totalReceived = totalReceivedNT.value;

		if (!totalReceived) {
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

		const message = `📅💵 Você gastou *${formatPrice(totalSpent.value || 0)}* e recebeu *${formatPrice(totalReceived.value || 0)}* no mês passado!`;

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
		name: "last-month-spent-and-received",
		description: "Get the last month spent or received for the user.",
	},
);
