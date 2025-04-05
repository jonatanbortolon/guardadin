"use server";
import { kysely } from "@/libs/kysely";
import { session } from "@/libs/session";
import { BaseActionErrorReturn } from "@/types/base-action-error-return";
import { ResultAsync } from "neverthrow";
import { redirect } from "next/navigation";

export async function deleteTransactionAction(
	transactionId: number | undefined,
	_state: BaseActionErrorReturn,
	_formData: FormData,
): Promise<BaseActionErrorReturn> {
	const sessionNT = await ResultAsync.fromPromise(session.getSession(), () => ({
		message: "Tivemos um problema no servidor",
	}));

	if (sessionNT.isErr()) {
		return sessionNT.error;
	}

	const { userId } = sessionNT.value;

	if (!userId) {
		return {
			message: "Você precisa estar autenticado",
		};
	}

	if (!transactionId) {
		return {
			message: "ID da transação é obrigatório",
		};
	}

	const deletedTransactionNT = await ResultAsync.fromPromise(
		kysely
			.deleteFrom("transactions")
			.returningAll()
			.where(({ eb, and }) =>
				and([eb("id", "=", transactionId), eb("userId", "=", userId)]),
			)
			.execute(),
		() => ({
			message: "Tivemos um problema no servidor",
		}),
	);

	if (deletedTransactionNT.isErr()) {
		return deletedTransactionNT.error;
	}

	redirect("/transactions");
}
