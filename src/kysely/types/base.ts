import { ColumnType, Generated } from "kysely";

export type BaseModel = {
	id: Generated<number>;
	createdAt: ColumnType<Date, never, never>;
	updatedAt: ColumnType<Date, never, never>;
};
