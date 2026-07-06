import type { Insertable, Selectable, Updateable } from "kysely";
import type { BaseModel } from "@/kysely/types/base";

export type CategoryTable = {
	name: string;
	isDefault: boolean;
} & BaseModel;

export type Category = Selectable<CategoryTable>;
export type NewCategory = Insertable<CategoryTable>;
export type UpdateCategory = Updateable<CategoryTable>;
