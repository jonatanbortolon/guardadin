import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { kysely } from "@/libs/kysely";

const deleteTransactionSchema = z.object({
	id: z.number().int().describe("Id of the transaction to delete."),
});

export const deleteTransactionTool = tool(
	async ({ id }) => {
		try {
			const deleted = await kysely
				.deleteFrom("transactions")
				.where("id", "=", id)
				.returningAll()
				.executeTakeFirst();

			if (!deleted) {
				return `Não encontrei a transação #${id}.`;
			}

			return `🟢 Transação #${id} excluída com sucesso!`;
		} catch (error) {
			console.error(error);
			return "Não consegui excluir a transação por um erro no servidor. Tente novamente.";
		}
	},
	{
		name: "delete_transaction",
		description: "Delete a transaction by its id.",
		schema: deleteTransactionSchema,
	},
);
