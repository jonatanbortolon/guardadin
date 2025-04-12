import { GENERIC_ERROR_MESSAGE } from "@/consts/whatsapp/messages/generic-error";
import { kysely } from "@/libs/kysely";
import { whatsapp } from "@/libs/whatsapp";
import { tool } from "@langchain/core/tools";
import { ResultAsync } from "neverthrow";
import { z } from "zod";

const deleteTransactionToolSchema = z.object({
	id: z.number().describe("Id of the transaction to delete. Must be a number."),
});

export const deleteTransactionTool = tool(
	async ({ id }, { metadata }) => {
		const userId = metadata.userId;
		const phoneNumber = metadata.phoneNumber;

		const deletedTransactionNT = await ResultAsync.fromPromise(
			kysely
				.deleteFrom("transactions")
				.where(({ eb, and }) =>
					and([eb("id", "=", id), eb("userId", "=", userId)]),
				)
				.returningAll()
				.executeTakeFirst(),
			() => ({
				message: "Tivemos um problema no servidor",
			}),
		);

		if (deletedTransactionNT.isErr()) {
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

		const deletedTransaction = deletedTransactionNT.value;

		if (!deletedTransaction) {
			throw new Error("Transação não encontrada");
		}

		await whatsapp.sendMessage(
			phoneNumber,
			`🟢 Transação de ID:${id} excluída com sucesso!`,
		);
	},
	{
		name: "delete_transaction",
		description:
			"Delete transaction for the user. The user will be prompted to enter the id of the transaction to delete.",
		schema: deleteTransactionToolSchema,
	},
);
