import { BaseActionErrorReturn } from "@/types/base-action-error-return";
import { z } from "zod";

export const createTransactionSchema = z.object({
	description: z
		.string({
			required_error: "Descrição é obrigatória",
			invalid_type_error: "Descrição inválida",
		})
		.min(1, {
			message: "Descrição deve ter no mínimo 1 caractere",
		})
		.max(100, {
			message: "Descrição deve ter no máximo 100 caracteres",
		}),
	total: z.coerce
		.number({
			required_error: "Valor total é obrigatório",
			invalid_type_error: "Valor total inválido",
		})
		.positive({
			message: "Valor total deve ser positivo",
		}),
	totalParcels: z.coerce
		.number({
			required_error: "Número de parcelas é obrigatório",
			invalid_type_error: "Número de parcelas inválido",
		})
		.min(1, {
			message: "Número de parcelas deve ser maior ou igual a 1",
		}),
	type: z.enum(["INCOME", "EXPENSE"], {
		required_error: "Tipo de transação é obrigatório",
		invalid_type_error: "Tipo de transação inválido",
	}),
	boughtAt: z.coerce.date({
		required_error: "Data de compra é obrigatória",
		invalid_type_error: "Data de compra inválida",
	}),
	categoryId: z.coerce
		.number({
			invalid_type_error: "Categoria inválida",
		})
		.nullable(),
	bankAccountId: z.coerce
		.number({
			invalid_type_error: "Conta bancária inválida",
		})
		.nullable(),
});

export type CreateTransactionFormState = BaseActionErrorReturn<{
	description?: string[];
	total?: string[];
	totalParcels?: string[];
	type?: string[];
	boughtAt?: string[];
	categoryId?: string[];
	bankAccountId?: string[];
}>;
