import type { ColumnType, Insertable, Selectable, Updateable } from "kysely";
import type { UserPermissionType } from "@/enums/user-permission";
import type { BaseModel } from "@/kysely/types/base";

export type InviteTable = {
	token: string;
	email: string;
	permission: UserPermissionType;
	usedAt: ColumnType<Date | null, Date | null | undefined, Date | null>;
} & BaseModel;

export type Invite = Selectable<InviteTable>;
export type NewInvite = Insertable<InviteTable>;
export type UpdateInvite = Updateable<InviteTable>;
