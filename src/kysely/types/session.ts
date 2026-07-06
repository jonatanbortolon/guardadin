import type { ColumnType, Insertable, Selectable } from "kysely";

export type SessionTable = {
	id: string;
	userId: number;
	rememberMe: ColumnType<boolean, boolean | undefined, boolean>;
	expiresAt: ColumnType<Date, Date, Date>;
	rotatedAt: ColumnType<Date, Date | undefined, Date>;
	createdAt: ColumnType<Date, never, never>;
	updatedAt: ColumnType<Date, never, never>;
};

export type Session = Selectable<SessionTable>;
export type NewSession = Insertable<SessionTable>;
