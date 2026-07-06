import { addMonths } from "date-fns";

export type Installment = {
	parcelNumber: number;
	amount: number;
	dueAt: Date;
};

/**
 * Regra de negócio: receitas são sempre uma única parcela; despesas mantêm o
 * número de parcelas informado (mínimo 1).
 */
export function normalizeParcels(
	type: "INCOME" | "EXPENSE",
	totalParcels: number,
): number {
	if (type === "INCOME") {
		return 1;
	}

	return Math.max(1, Math.trunc(totalParcels));
}

/**
 * Divide o valor total em N parcelas (arredondando em centavos, com o resto
 * distribuído nas primeiras parcelas) e gera o vencimento mensal a partir da
 * data da compra.
 */
export function buildInstallments(params: {
	total: number;
	totalParcels: number;
	boughtAt: Date;
}): Installment[] {
	const n = Math.max(1, Math.trunc(params.totalParcels));
	const totalCents = Math.round(params.total * 100);
	const base = Math.floor(totalCents / n);
	const remainder = totalCents - base * n;

	return Array.from({ length: n }, (_, index) => ({
		parcelNumber: index + 1,
		amount: (base + (index < remainder ? 1 : 0)) / 100,
		dueAt: addMonths(params.boughtAt, index),
	}));
}
