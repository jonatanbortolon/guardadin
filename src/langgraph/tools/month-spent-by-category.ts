import { GENERIC_ERROR_MESSAGE } from "@/consts/whatsapp/messages/generic-error";
import { kysely } from "@/libs/kysely";
import { whatsapp } from "@/libs/whatsapp";
import { formatPrice } from "@/utils/format-price";
import { tool } from "@langchain/core/tools";
import { endOfMonth, startOfMonth } from "date-fns";
import { ResultAsync } from "neverthrow";

export const monthSpentByCategoryTool = tool(
	async (_args, { metadata }) => {
		const userId = metadata.userId;
		const phoneNumber = metadata.phoneNumber;

		const montStartDate = startOfMonth(new Date());
		const montEndDate = endOfMonth(new Date());

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
						eb("categories.userId", "=", userId),
						eb("transactions.userId", "=", userId),
						between("transactions.boughtAt", montStartDate, montEndDate),
					]),
				)
				.orderBy("totalSpent", "desc")
				.groupBy("categories.id")
				.execute(),
			console.error,
		);

		if (thisMonthSpentCategoriesNT.isErr()) {
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

		const thisMonthSpentCategories = thisMonthSpentCategoriesNT.value;

		const thisMonthSpentWithoutCategoryNT = await ResultAsync.fromPromise(
			kysely
				.selectFrom("transactions")
				.select(({ fn }) => [fn.sum<number | null>("total").as("totalSpent")])
				.where(({ and, eb, between }) =>
					and([
						eb("userId", "=", userId),
						eb("categoryId", "is", null),
						between("boughtAt", montStartDate, montEndDate),
					]),
				)
				.executeTakeFirst(),
			console.error,
		);

		if (thisMonthSpentWithoutCategoryNT.isErr()) {
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

		const thisMonthSpentWithoutCategory = thisMonthSpentWithoutCategoryNT.value;

		if (!thisMonthSpentWithoutCategory) {
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

		const message = `🏷️ *Seus gastos por categoria*\n\n- Sem categoria: *${formatPrice(thisMonthSpentWithoutCategory.totalSpent || 0)}*\n\n${thisMonthSpentCategories
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
		name: "month-spent-by-category",
		description: "Get the monthly spent per category for the user.",
	},
);
