import type { Insertable, Selectable, Updateable } from "kysely";
import type { BaseModel } from "@/kysely/types/base";

export type BankAccountTable = {
	name: string;
	isDefault: boolean;
} & BaseModel;

export type BankAccount = Selectable<BankAccountTable>;
export type NewBankAccount = Insertable<BankAccountTable>;
export type UpdateBankAccount = Updateable<BankAccountTable>;
