import { BaseActionErrorReturn } from "@/types/base-action-error-return";
import validator from "validator";
import { z } from "zod";

export const updateUserSchema = z.object({
	name: z
		.string({
			required_error: "Nome é obrigatório",
			invalid_type_error: "Nome inválido",
		})
		.min(3, {
			message: "Nome deve ter no mínimo 3 caracteres",
		})
		.max(50, {
			message: "Nome deve ter no máximo 50 caracteres",
		})
		.regex(/^([^0-9]*)$/, {
			message: "Nome não pode conter somente números",
		}),
	phone: z
		.string()
		.transform((value) => value.replace(/\D/g, ""))
		.refine(validator.isMobilePhone, {
			message: "Número de telefone inválido",
		}),
});

export type UpdateUserFormState = BaseActionErrorReturn<{
	name?: string[];
	phone?: string[];
}>;
