"use server";
import { kysely } from "@/libs/kysely";
import { session } from "@/libs/session";
import {
	UpdateCategoryFormState,
	updateCategorySchema,
} from "@/schemas/update-category";
import { parseFormData } from "@/utils/parse-formdata";
import { ResultAsync } from "neverthrow";
import { redirect } from "next/navigation";

export async function updateCategoryAction(
	categoryId: number | undefined,
	_state: UpdateCategoryFormState,
	formData: FormData,
): Promise<UpdateCategoryFormState> {
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

	const validatedFields = updateCategorySchema.safeParse(
		parseFormData(formData),
	);

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
		};
	}

	const { name } = validatedFields.data;

	const updatedCategoryNT = await ResultAsync.fromPromise(
		kysely
			.updateTable("categories")
			.returningAll()
			.where(({ eb, and }) =>
				and([eb("id", "=", categoryId), eb("userId", "=", userId)]),
			)
			.set({
				name,
				isDefault: false,
			})
			.execute(),
		() => ({
			message: "Tivemos um problema no servidor",
		}),
	);

	if (updatedCategoryNT.isErr()) {
		return updatedCategoryNT.error;
	}

	redirect("/categories");
}
