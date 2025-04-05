import { Database } from "@/kysely/types";
import { NewTransaction } from "@/kysely/types/transaction";
import { kysely } from "@/libs/kysely";
import { whatsapp } from "@/libs/whatsapp";
import { Transaction } from "kysely";

const tools: {
	create_transaction: (
		userId: number,
		phoneNumber: string,
		args: NewTransaction,
		ops?: { trx: Transaction<Database> },
	) => Promise<void>;
	delete_transaction: (
		userId: number,
		phoneNumber: string,
		args: { id: number },
		ops?: { trx: Transaction<Database> },
	) => Promise<void>;
} = {
	create_transaction,
	delete_transaction,
};

async function create_transaction(
	userId: number,
	phoneNumber: string,
	args: NewTransaction,
	opts?: { trx: Transaction<Database> },
) {
	const createdTransaction = await (opts?.trx || kysely)
		.insertInto("transactions")
		.values(args)
		.returningAll()
		.executeTakeFirst();

	if (!createdTransaction) {
		return;
	}

	await whatsapp.sendSuccessCreatedMessage(
		userId,
		phoneNumber,
		createdTransaction,
		opts,
	);

	return;
}

async function delete_transaction(
	userId: number,
	phoneNumber: string,
	args: { id: number },
	opts?: { trx: Transaction<Database> },
) {
	if (!args.id) {
		throw new Error("ID da transação é obrigatória");
	}

	const deletedTransaction = await (opts?.trx || kysely)
		.deleteFrom("transactions")
		.where(({ eb, and }) =>
			and([eb("id", "=", args.id), eb("userId", "=", userId)]),
		)
		.returningAll()
		.executeTakeFirst();

	if (!deletedTransaction) {
		throw new Error("Transação não encontrada");
	}

	await whatsapp.sendSuccessDeletedMessage(
		userId,
		phoneNumber,
		deletedTransaction,
		opts,
	);

	return;
}

export function getFunctionTools() {
	return tools;
}
