"use server";
import { kysely } from "@/libs/kysely";
import { session } from "@/libs/session";
import { BaseActionErrorReturn } from "@/types/base-action-error-return";
import { ResultAsync } from "neverthrow";
import { redirect } from "next/navigation";

export async function deleteCategoryAction(
	categoryId: number | undefined,
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

	if (!categoryId) {
		return {
			message: "ID da categoria é obrigatória",
		};
	}

	const deletedCategoryNT = await ResultAsync.fromPromise(
		kysely
			.deleteFrom("categories")
			.returningAll()
			.where(({ eb, and }) =>
				and([eb("id", "=", categoryId), eb("userId", "=", userId)]),
			)
			.execute(),
		() => ({
			message: "Tivemos um problema no servidor",
		}),
	);

	if (deletedCategoryNT.isErr()) {
		return deletedCategoryNT.error;
	}

	redirect("/categories");
}
