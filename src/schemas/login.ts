import { BaseActionErrorReturn } from "@/types/base-action-error-return";
import { z } from "zod";

export const loginSchema = z.object({
	email: z
		.string({
			required_error: "Email é obrigatório",
			invalid_type_error: "Email inválido",
		})
		.toLowerCase()
		.email({
			message: "Email inválido",
		}),
	password: z
		.string({
			required_error: "Senha é obrigatória",
			invalid_type_error: "Senha inválida",
		})
		.min(5, {
			message: "Senha deve ter no mínimo 5 caracteres",
		})
		.max(100, {
			message: "Senha deve ter no máximo 100 caracteres",
		}),
});

export type LoginFormState = BaseActionErrorReturn<{
	email?: string[];
	password?: string[];
}>;
