import { Database } from "@/kysely/types";
import { BankAccount } from "@/kysely/types/bank-account";
import { Category } from "@/kysely/types/category";
import { Transaction } from "@/kysely/types/transaction";
import { env } from "@/libs/env";
import { kysely } from "@/libs/kysely";
import { formatDate } from "@/utils/format-date";
import { formatPrice } from "@/utils/format-price";
import { saveAssistantMessage } from "@/utils/save-assistant-chat";
import axios from "axios";
import { Transaction as KyselyTransaction } from "kysely";

const whatsappClient = axios.create({
	baseURL: `https://graph.facebook.com/v22.0/${env.WHATSAPP_PHONE_NUMBER_ID}/`,
	headers: {
		"Content-Type": "application/json",
		Authorization: `Bearer ${env.WHATSAPP_TOKEN}`,
	},
});

export const whatsapp = {
	async sendErrorMessage(
		userId: number,
		receiverPhoneNumber: string,
		opts?: {
			trx: KyselyTransaction<Database>;
		},
	) {
		const message =
			"Não consegui processar seu pedido. Por favor, tente novamente.";

		await saveAssistantMessage(userId, message, opts);

		await whatsappClient.post("messages", {
			messaging_product: "whatsapp",
			recipient_type: "individual",
			to: receiverPhoneNumber,
			type: "text",
			text: {
				body: message,
			},
		});
	},
	async sendSuccessCreatedMessage(
		userId: number,
		receiverPhoneNumber: string,
		transaction: Transaction,
		opts?: {
			trx: KyselyTransaction<Database>;
		},
	) {
		let category: Category | null = null;
		let bankAccount: BankAccount | null = null;

		if (transaction.categoryId) {
			category =
				(await (opts?.trx || kysely)
					.selectFrom("categories")
					.selectAll()
					.where(({ eb, and }) =>
						and([
							eb("id", "=", transaction.categoryId),
							eb("userId", "=", userId),
						]),
					)
					.executeTakeFirst()) || null;
		}

		if (transaction.bankAccountId) {
			bankAccount =
				(await (opts?.trx || kysely)
					.selectFrom("bank_accounts")
					.selectAll()
					.where(({ eb, and }) =>
						and([
							eb("id", "=", transaction.bankAccountId),
							eb("userId", "=", userId),
						]),
					)
					.executeTakeFirst()) || null;
		}

		const message = `💰 Transação Concluída! 🎉\n\n🆔 Código: ${transaction.id}\n\n📌 Detalhes da Operação:\n───────────────────────\n✏️ Título: ${transaction.description}\n💵 Valor: ${formatPrice(transaction.total)}\n➗ Parcelas: ${transaction.totalParcels}\n🔄 Tipo: ${transaction.type === "EXPENSE" ? "🟥 Saída" : "🟩 Entrada"}\n${category ? `🏷️ Tag: ${category.name}\n` : ""}${bankAccount ? `🏦 Conta Bancária: ${bankAccount.name}\n` : ""}📅 Data: ${formatDate(new Date(transaction.boughtAt))}\n\n📈 Gerencie melhor seus gastos!
Esta movimentação já está registrada em seu histórico financeiro.
Acesse seu Dashboard Completo em: ${env.TRANSACTIONS_URL}
\n\n🚨 Cancelar esta transação?\nEnvie: "Cancelar transação ${transaction.id}" e nós resolvemos!`;

		await saveAssistantMessage(userId, message, opts);

		await whatsappClient.post("messages", {
			messaging_product: "whatsapp",
			recipient_type: "individual",
			to: receiverPhoneNumber,
			type: "text",
			text: {
				body: message,
			},
		});
	},
	async sendSuccessDeletedMessage(
		userId: number,
		receiverPhoneNumber: string,
		transaction: Transaction,
		opts?: {
			trx: KyselyTransaction<Database>;
		},
	) {
		const message = `❗Transação ${transaction.id} deletada com sucesso!`;

		await saveAssistantMessage(userId, message, opts);

		await whatsappClient.post("messages", {
			messaging_product: "whatsapp",
			recipient_type: "individual",
			to: receiverPhoneNumber,
			type: "text",
			text: {
				body: message,
			},
		});
	},
};
