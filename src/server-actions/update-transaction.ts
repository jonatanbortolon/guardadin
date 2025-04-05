"use server";
import { kysely } from "@/libs/kysely";
import { session } from "@/libs/session";
import {
	UpdateTransactionFormState,
	updateTransactionSchema,
} from "@/schemas/update-transaction";
import { parseFormData } from "@/utils/parse-formdata";
import { ResultAsync } from "neverthrow";
import { redirect } from "next/navigation";

export async function updateTransactionAction(
	transactionId: number | undefined,
	_state: UpdateTransactionFormState,
	formData: FormData,
): Promise<UpdateTransactionFormState> {
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
			message: "ID da transação é obrigatória",
		};
	}

	const validatedFields = updateTransactionSchema.safeParse(
		parseFormData(formData),
	);

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
		};
	}

	const {
		description,
		total,
		totalParcels,
		type,
		boughtAt,
		categoryId,
		bankAccountId,
	} = validatedFields.data;

	if (categoryId !== null) {
		const categoryNT = await ResultAsync.fromPromise(
			kysely
				.selectFrom("categories")
				.selectAll()
				.where(({ eb, and }) =>
					and([eb("id", "=", categoryId), eb("userId", "=", userId)]),
				)
				.executeTakeFirst(),
			() => ({
				message: "Tivemos um problema no servidor",
			}),
		);

		if (categoryNT.isErr()) {
			return categoryNT.error;
		}

		const category = categoryNT.value;

		if (!category) {
			return {
				errors: { categoryId: ["Categoria não encontrada"] },
			};
		}
	}

	if (bankAccountId !== null) {
		const bankAccountNT = await ResultAsync.fromPromise(
			kysely
				.selectFrom("bank_accounts")
				.selectAll()
				.where(({ eb, and }) =>
					and([eb("id", "=", bankAccountId), eb("userId", "=", userId)]),
				)
				.executeTakeFirst(),
			() => ({
				message: "Tivemos um problema no servidor",
			}),
		);

		if (bankAccountNT.isErr()) {
			return bankAccountNT.error;
		}

		const bankAccount = bankAccountNT.value;

		if (!bankAccount) {
			return {
				errors: { bankAccountId: ["Conta bancária não encontrada"] },
			};
		}
	}

	const updatedTransactionNT = await ResultAsync.fromPromise(
		kysely
			.updateTable("transactions")
			.returningAll()
			.where(({ eb, and }) =>
				and([eb("id", "=", transactionId), eb("userId", "=", userId)]),
			)
			.set({
				description,
				total,
				totalParcels,
				type,
				boughtAt,
				categoryId,
				bankAccountId,
			})
			.execute(),
		() => ({
			message: "Tivemos um problema no servidor",
		}),
	);

	if (updatedTransactionNT.isErr()) {
		return updatedTransactionNT.error;
	}

	redirect("/transactions");
}
