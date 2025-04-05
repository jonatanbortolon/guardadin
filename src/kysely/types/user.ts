import { BaseModel } from "@/kysely/types/base";
import { ColumnType, Insertable, Selectable, Updateable } from "kysely";

export type UserTable = {
	name: string;
	phone: string;
	email: string;
	password: ColumnType<string, string, string | undefined>;
} & BaseModel;

export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UpdateUser = Updateable<UserTable>;
