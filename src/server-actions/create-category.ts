"use server";
import { kysely } from "@/libs/kysely";
import { session } from "@/libs/session";
import {
	CreateCategoryFormState,
	createCategorySchema,
} from "@/schemas/create-category";
import { parseFormData } from "@/utils/parse-formdata";
import { ResultAsync } from "neverthrow";
import { redirect } from "next/navigation";

export async function createCategoryAction(
	_state: CreateCategoryFormState,
	formData: FormData,
): Promise<CreateCategoryFormState> {
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

	const validatedFields = createCategorySchema.safeParse(
		parseFormData(formData),
	);

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
		};
	}

	const { name } = validatedFields.data;

	const newCategoryNT = await ResultAsync.fromPromise(
		kysely
			.insertInto("categories")
			.returningAll()
			.values({
				name,
				isDefault: false,
				userId,
			})
			.execute(),
		() => ({
			message: "Tivemos um problema no servidor",
		}),
	);

	if (newCategoryNT.isErr()) {
		return newCategoryNT.error;
	}

	redirect("/categories");
}
