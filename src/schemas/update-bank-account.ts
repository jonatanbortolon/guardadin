import { BaseActionErrorReturn } from "@/types/base-action-error-return";
import { z } from "zod";

export const updateBankAccountSchema = z.object({
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
		}),
	isDefault: z.coerce
		.boolean({
			required_error: "É obrigatório",
			invalid_type_error: "Valor inválido",
		})
		.default(false),
});

export type UpdateBankAccountFormState = BaseActionErrorReturn<{
	name?: string[];
	isDefault?: string[];
}>;
