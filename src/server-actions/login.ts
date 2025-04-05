"use server";
import { kysely } from "@/libs/kysely";
import { session } from "@/libs/session";
import { LoginFormState, loginSchema } from "@/schemas/login";
import { parseFormData } from "@/utils/parse-formdata";
import bcrypt from "bcryptjs";
import { ResultAsync } from "neverthrow";
import { redirect } from "next/navigation";

export async function loginAction(
	_state: LoginFormState,
	formData: FormData,
): Promise<LoginFormState> {
	const validatedFields = loginSchema.safeParse(parseFormData(formData));

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
		};
	}

	const { email, password } = validatedFields.data;

	const userNT = await ResultAsync.fromPromise(
		kysely
			.selectFrom("users")
			.selectAll()
			.where("email", "=", email)
			.executeTakeFirst(),
		() => ({
			message: "Tivemos um problema no servidor",
		}),
	);

	if (userNT.isErr()) {
		return userNT.error;
	}

	const user = userNT.value;

	if (!user) {
		return {
			errors: {
				email: ["Email não encontrado"],
			},
		};
	}

	const passwordMatchNT = await ResultAsync.fromPromise(
		bcrypt.compare(password, user.password),
		() => ({
			message: "Tivemos um problema no servidor",
		}),
	);

	if (passwordMatchNT.isErr()) {
		return passwordMatchNT.error;
	}

	const passwordMatch = passwordMatchNT.value;

	if (!passwordMatch) {
		return {
			errors: {
				password: ["Senha incorreta"],
			},
		};
	}

	const createSessionNT = await ResultAsync.fromPromise(
		session.createSession(user.id),
		() => ({
			message: "Tivemos um problema no servidor",
		}),
	);

	if (createSessionNT.isErr()) {
		return createSessionNT.error;
	}

	redirect("/transactions");
}
