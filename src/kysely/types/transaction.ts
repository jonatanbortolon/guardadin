import type { Insertable, Selectable, Updateable } from "kysely";
import type { TransactionType } from "@/enums/transacation-type";
import type { BaseModel } from "@/kysely/types/base";

export type TransactionTable = {
	totalParcels: number;
	description: string;
	total: number;
	type: (typeof TransactionType)[keyof typeof TransactionType];
	boughtAt: Date;
	categoryId: number | null;
	bankAccountId: number | null;
} & BaseModel;

export type Transaction = Selectable<TransactionTable>;
export type NewTransaction = Insertable<TransactionTable>;
export type UpdateTransaction = Updateable<TransactionTable>;
