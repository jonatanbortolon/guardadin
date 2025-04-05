"use server";
import { kysely } from "@/libs/kysely";
import { session } from "@/libs/session";
import {
	CreateBankAccountFormState,
	createBankAccountSchema,
} from "@/schemas/create-bank-account";
import { parseFormData } from "@/utils/parse-formdata";
import { ResultAsync } from "neverthrow";
import { redirect } from "next/navigation";

export async function createBankAccountAction(
	_state: CreateBankAccountFormState,
	formData: FormData,
): Promise<CreateBankAccountFormState> {
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

	const validatedFields = createBankAccountSchema.safeParse(
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

	const newBankAccountNT = await ResultAsync.fromPromise(
		kysely
			.insertInto("bank_accounts")
			.returningAll()
			.values({
				name,
				isDefault,
				userId,
			})
			.execute(),
		() => ({
			message: "Tivemos um problema no servidor",
		}),
	);

	if (newBankAccountNT.isErr()) {
		return newBankAccountNT.error;
	}

	redirect("/bank-accounts");
}
