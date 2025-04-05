import { BaseModel } from "@/kysely/types/base";
import { Insertable, Selectable, Updateable } from "kysely";

export type TransactionPaymentTable = {
	transactionId: number;
	amount: number;
	parcelNumber: number;
} & BaseModel;

export type TransactionPayment = Selectable<TransactionPaymentTable>;
export type NewTransactionPayment = Insertable<TransactionPaymentTable>;
export type UpdateTransactionPayment = Updateable<TransactionPaymentTable>;
