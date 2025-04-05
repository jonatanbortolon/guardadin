import { TransactionType } from "@/enums/transacation-type";
import { BaseModel } from "@/kysely/types/base";
import { Insertable, Selectable, Updateable } from "kysely";

export type TransactionTable = {
	userId: number;
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
