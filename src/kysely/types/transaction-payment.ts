import type { Insertable, Selectable, Updateable } from "kysely";
import type { BaseModel } from "@/kysely/types/base";

export type TransactionPaymentTable = {
	transactionId: number;
	amount: number;
	parcelNumber: number;
	dueAt: Date;
} & BaseModel;

export type TransactionPayment = Selectable<TransactionPaymentTable>;
export type NewTransactionPayment = Insertable<TransactionPaymentTable>;
export type UpdateTransactionPayment = Updateable<TransactionPaymentTable>;
