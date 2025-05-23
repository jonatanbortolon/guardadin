import { GENERIC_ERROR_MESSAGE } from "@/consts/whatsapp/messages/generic-error";
import { kysely } from "@/libs/kysely";
import { whatsapp } from "@/libs/whatsapp";
import { formatPrice } from "@/utils/format-price";
import { tool } from "@langchain/core/tools";
import { endOfMonth, intervalToDuration, startOfMonth } from "date-fns";
import { ResultAsync } from "neverthrow";

export const monthSpentAndReceivedTool = tool(
	async (_args, { metadata }) => {
		const userId = metadata.userId;
		const phoneNumber = metadata.phoneNumber;

		const montStartDate = startOfMonth(new Date());
		const montEndDate = endOfMonth(new Date());

		const totalSpentNT = await ResultAsync.fromPromise(
			kysely
				.selectFrom("transactions")
				.select(({ fn }) => [fn.sum<number | null>("total").as("value")])
				.where(({ eb, and, between }) =>
					and([
						eb("userId", "=", userId),
						between("boughtAt", montStartDate, montEndDate),
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
						between("boughtAt", montStartDate, montEndDate),
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

		const monthDaysLeft =
			intervalToDuration({
				start: new Date(),
				end: montEndDate,
			}).days || null;

		const message = `📅💵 Você gastou *${formatPrice(totalSpent.value || 0)}* e recebeu *${formatPrice(totalReceived.value || 0)}* até o momento neste mês!\n\n⚠️ Faltam ${monthDaysLeft} dias para finalizar o mês, organize sua conta antes de gastar para sobrar um graninha para o próximo!`;

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
		name: "month-spent-and-received",
		description: "Get the monthly spent or received for the user.",
	},
);
