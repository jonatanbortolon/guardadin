export const UserPermission = {
	READ_ONLY: "READ_ONLY",
	ALL: "ALL",
} as const;

export type UserPermissionType =
	(typeof UserPermission)[keyof typeof UserPermission];
