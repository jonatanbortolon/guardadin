import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import type { TransactionType } from "@/enums/transacation-type";
import { kysely } from "@/libs/kysely";

export type MonthRange = { start: Date; end: Date };

export function monthRange(offset = 0): MonthRange {
	const base = subMonths(new Date(), offset);
	return { start: startOfMonth(base), end: endOfMonth(base) };
}

export async function sumByType(
	type: (typeof TransactionType)[keyof typeof TransactionType],
	{ start, end }: MonthRange,
): Promise<number> {
	const row = await kysely
		.selectFrom("transactions")
		.select(({ fn }) => [fn.sum<number | null>("total").as("value")])
		.where("type", "=", type)
		.where((eb) => eb.between("boughtAt", start, end))
		.executeTakeFirst();

	return row?.value ?? 0;
}

export function rankPrefix(index: number): string {
	return ["🥇", "🥈", "🥉"][index] ?? `${index + 1}.`;
}
