import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { env } from "@/libs/env";
import { buildInstallments, normalizeParcels } from "@/libs/installments";
import { kysely } from "@/libs/kysely";
import { formatDate } from "@/utils/format-date";
import { formatPrice } from "@/utils/format-price";

const createTransactionSchema = z.object({
	description: z.string().min(1).describe("Short title of the transaction."),
	total: z.number().positive().describe("Amount in BRL, must be positive."),
	totalParcels: z
		.number()
		.int()
		.min(1)
		.describe("Number of installments, minimum 1."),
	type: z
		.enum(["INCOME", "EXPENSE"])
		.describe("INCOME for entrada, EXPENSE for saída."),
	boughtAt: z
		.string()
		.describe(
			"Transaction date in ISO format (e.g. 2024-03-01T00:00:00.000Z).",
		),
	categoryId: z
		.number()
		.int()
		.optional()
		.describe(
			"Category id, must exist in the provided category list. Optional: if the user does not specify a category, leave it empty and the default category will be used.",
		),
	bankAccountId: z
		.number()
		.int()
		.optional()
		.describe(
			"Bank account id, must exist in the provided bank account list. Optional: if the user does not specify a bank account, leave it empty and the default bank account will be used.",
		),
});

export const createTransactionTool = tool(
	async (input) => {
		const category = input.categoryId
			? await kysely
					.selectFrom("categories")
					.selectAll()
					.where("id", "=", input.categoryId)
					.executeTakeFirst()
			: await kysely
					.selectFrom("categories")
					.selectAll()
					.where("isDefault", "=", true)
					.executeTakeFirst();

		if (!category) {
			return input.categoryId
				? "Categoria inválida. Peça para o usuário escolher uma das categorias disponíveis."
				: "Nenhuma categoria foi especificada e não há categoria padrão definida. Peça para o usuário escolher uma das categorias disponíveis.";
		}

		const bankAccount = input.bankAccountId
			? await kysely
					.selectFrom("bank_accounts")
					.selectAll()
					.where("id", "=", input.bankAccountId)
					.executeTakeFirst()
			: await kysely
					.selectFrom("bank_accounts")
					.selectAll()
					.where("isDefault", "=", true)
					.executeTakeFirst();

		if (!bankAccount) {
			return input.bankAccountId
				? "Conta bancária inválida. Peça para o usuário escolher uma das contas disponíveis."
				: "Nenhuma conta bancária foi especificada e não há conta padrão definida. Peça para o usuário escolher uma das contas disponíveis.";
		}

		const boughtAt = new Date(input.boughtAt);
		const totalParcels = normalizeParcels(input.type, input.totalParcels);

		try {
			const created = await kysely.transaction().execute(async (trx) => {
				const transaction = await trx
					.insertInto("transactions")
					.values({
						description: input.description,
						total: input.total,
						totalParcels,
						type: input.type,
						boughtAt,
						categoryId: category.id,
						bankAccountId: bankAccount.id,
					})
					.returningAll()
					.executeTakeFirstOrThrow();

				await trx
					.insertInto("transaction_payments")
					.values(
						buildInstallments({
							total: input.total,
							totalParcels,
							boughtAt,
						}).map((installment) => ({
							transactionId: transaction.id,
							parcelNumber: installment.parcelNumber,
							amount: installment.amount,
							dueAt: installment.dueAt,
						})),
					)
					.execute();

				return transaction;
			});

			return `💰 Transação registrada! 🎉\n\n🆔 Código: ${created.id}\n✏️ Título: ${created.description}\n💵 Valor: ${formatPrice(
				created.total,
			)}\n➗ Parcelas: ${created.totalParcels}\n🔄 Tipo: ${
				created.type === "EXPENSE" ? "🟥 Saída" : "🟩 Entrada"
			}\n🏷️ Categoria: ${category.name}\n🏦 Conta: ${bankAccount.name}\n📅 Data: ${formatDate(
				new Date(created.boughtAt),
			)}\n\n📈 Acesse seu dashboard: ${env.TRANSACTIONS_URL}\n\n🚨 Para cancelar, envie: "Cancelar transação ${created.id}".`;
		} catch (error) {
			console.error(error);
			return "Não consegui registrar a transação por um erro no servidor. Tente novamente.";
		}
	},
	{
		name: "create_transaction",
		description:
			"Register a transaction (entrada/saída) once ALL fields have been collected from the user. Every field is required.",
		schema: createTransactionSchema,
	},
);
