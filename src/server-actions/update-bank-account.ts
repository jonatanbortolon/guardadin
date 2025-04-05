"use server";
import { kysely } from "@/libs/kysely";
import { session } from "@/libs/session";
import {
	UpdateBankAccountFormState,
	updateBankAccountSchema,
} from "@/schemas/update-bank-account";
import { parseFormData } from "@/utils/parse-formdata";
import { ResultAsync } from "neverthrow";
import { redirect } from "next/navigation";

export async function updateBankAccountAction(
	bankAccountId: number | undefined,
	_state: UpdateBankAccountFormState,
	formData: FormData,
): Promise<UpdateBankAccountFormState> {
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

	const validatedFields = updateBankAccountSchema.safeParse(
		parseFormData(formData),
	);

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
		};
	}

	const { name, isDefault } = validatedFields.data;

	if (isDefault) {
		const alreadyExistsDefaultBankAccountNT = await ResultAsync.fromPromise(
			kysely
				.selectFrom("bank_accounts")
				.selectAll()
				.where("isDefault", "=", true)
				.where("userId", "=", userId)
				.executeTakeFirst(),
			() => ({
				message: "Tivemos um problema no servidor",
			}),
		);

		if (alreadyExistsDefaultBankAccountNT.isErr()) {
			return alreadyExistsDefaultBankAccountNT.error;
		}

		const alreadyExistsDefaultBankAccount =
			alreadyExistsDefaultBankAccountNT.value;

		if (alreadyExistsDefaultBankAccount) {
			return {
				message: `Sua conta bancária ${alreadyExistsDefaultBankAccount.name} já é sua conta bancária padrão.`,
			};
		}
	}

	const updatedBankAccountNT = await ResultAsync.fromPromise(
		kysely
			.updateTable("bank_accounts")
			.returningAll()
			.where(({ eb, and }) =>
				and([eb("id", "=", bankAccountId), eb("userId", "=", userId)]),
			)
			.set({
				name,
				isDefault,
				userId,
			})
			.execute(),
		() => ({
			message: "Tivemos um problema no servidor",
		}),
	);

	if (updatedBankAccountNT.isErr()) {
		return updatedBankAccountNT.error;
	}

	redirect("/bank-accounts");
}
