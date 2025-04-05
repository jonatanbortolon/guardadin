"use server";
import { kysely } from "@/libs/kysely";
import { session } from "@/libs/session";
import { BaseActionErrorReturn } from "@/types/base-action-error-return";
import { ResultAsync } from "neverthrow";
import { redirect } from "next/navigation";

export async function deleteBankAccountAction(
	bankAccountId: number | undefined,
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

	if (!bankAccountId) {
		return {
			message: "ID da conta bancária é obrigatória",
		};
	}

	const deletedBankAccountNT = await ResultAsync.fromPromise(
		kysely
			.deleteFrom("bank_accounts")
			.returningAll()
			.where(({ eb, and }) =>
				and([eb("id", "=", bankAccountId), eb("userId", "=", userId)]),
			)
			.execute(),
		() => ({
			message: "Tivemos um problema no servidor",
		}),
	);

	if (deletedBankAccountNT.isErr()) {
		return deletedBankAccountNT.error;
	}

	redirect("/bank-accounts");
}
