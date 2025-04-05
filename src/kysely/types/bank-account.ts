import { BaseModel } from "@/kysely/types/base";
import { Insertable, Selectable, Updateable } from "kysely";

export type BankAccountTable = {
	name: string;
	isDefault: boolean;
	userId: number;
} & BaseModel;

export type BankAccount = Selectable<BankAccountTable>;
export type NewBankAccount = Insertable<BankAccountTable>;
export type UpdateBankAccount = Updateable<BankAccountTable>;
