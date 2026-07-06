import { z } from "zod";
import { fieldError } from "@/utils/zod";

export const createCategorySchema = z.object({
	name: z
		.string(fieldError("Nome é obrigatório", "Nome inválido"))
		.min(3, {
			message: "Nome deve ter no mínimo 3 caracteres",
		})
		.max(50, {
			message: "Nome deve ter no máximo 50 caracteres",
		}),
	isDefault: z.coerce
		.boolean(fieldError("É obrigatório", "Valor inválido"))
		.default(false),
});
