import { GENERIC_ERROR_MESSAGE } from "@/consts/whatsapp/messages/generic-error";
import { BankAccount } from "@/kysely/types/bank-account";
import { Category } from "@/kysely/types/category";
import { env } from "@/libs/env";
import { kysely } from "@/libs/kysely";
import { whatsapp } from "@/libs/whatsapp";
import { formatDate } from "@/utils/format-date";
import { formatPrice } from "@/utils/format-price";
import { tool } from "@langchain/core/tools";
import { ResultAsync } from "neverthrow";
import { z } from "zod";

const createTransactionToolSchema = z.object({
	description: z
		.string()
		.describe(
			"Transaction description that can contains the product or service that the user provides. Only substantive information and adjectives are allowed. Verbs and adverbs are not allowed. Substantivated verbs are not allowed",
		),
	total: z
		.number()
		.positive()
		.min(1)
		.describe(
			"Total amount of the transaction. Cannot be negative or equal to 0.",
		),
	totalParcels: z
		.number()
		.int()
		.min(1)
		.describe(
			"Total parcels of the transaction, one parcel is equivalent to one month. Minimum is 1.",
		),
	type: z
		.enum(["INCOME", "EXPENSE"])
		.describe(
			"Type of the transaction. Can be INCOME for money income or EXPENSE for money expense.",
		),
	boughtAt: z
		.string()
		.describe(
			"Date when the transaction was bought. Must be in ISO format. Example: 2023-03-01T00:00:00.000Z. If hasn't specified, the today's date will be used. Future dates are allowed.",
		)
		.nullish(),
	categoryId: z
		.number()
		.describe(
			"Category id of the transaction. Must be a number. If hasn't suitable category pass null",
		)
		.nullish(),
	bankAccountId: z
		.number()
		.describe(
			"Bank account id of the transaction. Must be a number. If user doesn't specify, the default bank account will be used, if user doesn't have a default bank account, pass null.",
		)
		.nullish(),
});

export const createTransactionTool = tool(
	async (
		{
			description,
			type,
			total,
			totalParcels,
			boughtAt,
			categoryId,
			bankAccountId,
		},
		{ metadata },
	) => {
		const boughtAtDate = boughtAt ? new Date(boughtAt) : new Date();

		const userId = metadata.userId;
		const phoneNumber = metadata.phoneNumber;

		const createdTransactionNT = await ResultAsync.fromPromise(
			kysely
				.insertInto("transactions")
				.values({
					userId,
					description,
					type,
					total,
					totalParcels,
					boughtAt: boughtAtDate,
					categoryId,
					bankAccountId,
				})
				.returningAll()
				.executeTakeFirst(),
			() => ({
				message: "Tivemos um problema no servidor",
			}),
		);

		if (createdTransactionNT.isErr()) {
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

		const createdTransaction = createdTransactionNT.value;

		if (!createdTransaction) {
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

		let category: Category | null = null;
		let bankAccount: BankAccount | null = null;

		if (createdTransaction.categoryId) {
			const categoryNT = await ResultAsync.fromPromise(
				kysely
					.selectFrom("categories")
					.selectAll()
					.where(({ eb, and }) =>
						and([
							eb("id", "=", createdTransaction.categoryId),
							eb("userId", "=", userId),
						]),
					)
					.executeTakeFirst(),
				console.error,
			);

			if (categoryNT.isOk()) {
				category = categoryNT.value || null;
			}
		}

		if (createdTransaction.bankAccountId) {
			const bankAccountNT = await ResultAsync.fromPromise(
				kysely
					.selectFrom("bank_accounts")
					.selectAll()
					.where(({ eb, and }) =>
						and([
							eb("id", "=", createdTransaction.bankAccountId),
							eb("userId", "=", userId),
						]),
					)
					.executeTakeFirst(),
				console.error,
			);

			if (bankAccountNT.isOk()) {
				bankAccount = bankAccountNT.value || null;
			}
		}

		const message = `💰 Transação Concluída! 🎉\n\n🆔 Código: ${createdTransaction.id}\n\n📌 Detalhes da Operação:\n───────────────────────\n✏️ Título: ${createdTransaction.description}\n💵 Valor: ${formatPrice(createdTransaction.total)}\n➗ Parcelas: ${createdTransaction.totalParcels}\n🔄 Tipo: ${createdTransaction.type === "EXPENSE" ? "🟥 Saída" : "🟩 Entrada"}\n${category ? `🏷️ Tag: ${category.name}\n` : ""}${bankAccount ? `🏦 Conta Bancária: ${bankAccount.name}\n` : ""}📅 Data: ${formatDate(new Date(createdTransaction.boughtAt))}\n\n📈 Gerencie melhor seus gastos!\nEsta movimentação já está registrada em seu histórico financeiro.\nAcesse seu Dashboard Completo em: ${env.TRANSACTIONS_URL}\n\n🚨 Cancelar esta transação?\nEnvie: "Cancelar transação ${createdTransaction.id}" e nós resolvemos!`;

		kysely
			.insertInto("chat_histories")
			.values({
				userId,
				role: "assistant",
				text: { content: message },
			})
			.execute();

		await ResultAsync.fromPromise(
			whatsapp.sendMessage(phoneNumber, message),
			console.error,
		);

		return;
	},
	{
		name: "create_transaction",
		description:
			"Create transacation for the user. The user will be prompted to enter the amount and the description of the transaction.",
		schema: createTransactionToolSchema,
	},
);
