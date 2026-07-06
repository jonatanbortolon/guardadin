import type { User } from "@/kysely/types/user";

export type PublicUser = Omit<
	User,
	| "passwordHash"
	| "emailConfirmationToken"
	| "passwordResetToken"
	| "passwordResetExpiresAt"
	| "twoFactorSecret"
	| "twoFactorRecoveryCodes"
>;

export function toPublicUser(user: User): PublicUser {
	return {
		id: user.id,
		email: user.email,
		name: user.name,
		phone: user.phone,
		isAdmin: user.isAdmin,
		botAllowed: user.botAllowed,
		permission: user.permission,
		emailConfirmedAt: user.emailConfirmedAt,
		twoFactorEnabled: user.twoFactorEnabled,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	};
}
