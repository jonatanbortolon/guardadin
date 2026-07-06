import { z } from "zod";
import { fieldError } from "@/utils/zod";

export const updateTransactionSchema = z.object({
	description: z
		.string(fieldError("Descrição é obrigatória", "Descrição inválida"))
		.min(1, {
			message: "Descrição deve ter no mínimo 1 caractere",
		})
		.max(100, {
			message: "Descrição deve ter no máximo 100 caracteres",
		}),
	total: z.coerce
		.number(fieldError("Valor total é obrigatório", "Valor total inválido"))
		.positive({
			message: "Valor total deve ser positivo",
		}),
	totalParcels: z.coerce
		.number(
			fieldError(
				"Número de parcelas é obrigatório",
				"Número de parcelas inválido",
			),
		)
		.min(1, {
			message: "Número de parcelas deve ser maior ou igual a 1",
		}),
	type: z.enum(
		["INCOME", "EXPENSE"],
		fieldError("Tipo de transação é obrigatório", "Tipo de transação inválido"),
	),
	boughtAt: z.coerce.date(
		fieldError("Data de compra é obrigatória", "Data de compra inválida"),
	),
	categoryId: z.coerce.number({ error: "Categoria inválida" }).nullable(),
	bankAccountId: z.coerce
		.number({ error: "Conta bancária inválida" })
		.nullable(),
});
