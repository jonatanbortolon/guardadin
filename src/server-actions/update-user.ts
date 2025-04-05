"use server";
import { kysely } from "@/libs/kysely";
import { session } from "@/libs/session";
import { UpdateUserFormState, updateUserSchema } from "@/schemas/update-user";
import { parseFormData } from "@/utils/parse-formdata";
import { ResultAsync } from "neverthrow";
import { redirect } from "next/navigation";

export async function updateUserAction(
	_state: UpdateUserFormState,
	formData: FormData,
): Promise<UpdateUserFormState> {
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

	const validatedFields = updateUserSchema.safeParse(parseFormData(formData));

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
		};
	}

	const { name, phone } = validatedFields.data;

	const updatedUserNT = await ResultAsync.fromPromise(
		kysely
			.updateTable("users")
			.returningAll()
			.where("id", "=", userId)
			.set({
				name,
				phone,
			})
			.execute(),
		() => ({
			message: "Tivemos um problema no servidor",
		}),
	);

	if (updatedUserNT.isErr()) {
		return updatedUserNT.error;
	}

	redirect("/profile");
}
