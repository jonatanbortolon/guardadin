import { BaseModel } from "@/kysely/types/base";
import { Insertable, Selectable, Updateable } from "kysely";

export type CategoryTable = {
	name: string;
	isDefault: boolean;
	userId: number;
} & BaseModel;

export type Category = Selectable<CategoryTable>;
export type NewCategory = Insertable<CategoryTable>;
export type UpdateCategory = Updateable<CategoryTable>;
