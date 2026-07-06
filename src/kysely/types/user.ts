import type { ColumnType, Insertable, Selectable, Updateable } from "kysely";
import type { UserPermissionType } from "@/enums/user-permission";
import type { BaseModel } from "@/kysely/types/base";

export type UserTable = {
	email: string;
	name: string;
	phone: string;
	passwordHash: string;
	isAdmin: boolean;
	botAllowed: ColumnType<boolean, boolean | undefined, boolean>;
	permission: UserPermissionType;
	emailConfirmedAt: ColumnType<
		Date | null,
		Date | null | undefined,
		Date | null
	>;
	emailConfirmationToken: ColumnType<
		string | null,
		string | null | undefined,
		string | null
	>;
	passwordResetToken: ColumnType<
		string | null,
		string | null | undefined,
		string | null
	>;
	passwordResetExpiresAt: ColumnType<
		Date | null,
		Date | null | undefined,
		Date | null
	>;
	twoFactorEnabled: ColumnType<boolean, boolean | undefined, boolean>;
	twoFactorSecret: ColumnType<
		string | null,
		string | null | undefined,
		string | null
	>;
	twoFactorRecoveryCodes: ColumnType<
		string | null,
		string | null | undefined,
		string | null
	>;
} & BaseModel;

export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UpdateUser = Updateable<UserTable>;
