import { z } from "zod";
import { UserPermission } from "@/enums/user-permission";
import { fieldError } from "@/utils/zod";

const nameSchema = z
	.string(fieldError("Nome é obrigatório", "Nome inválido"))
	.min(2, { message: "Nome deve ter no mínimo 2 caracteres" })
	.max(80, { message: "Nome deve ter no máximo 80 caracteres" });

const passwordSchema = z
	.string(fieldError("Senha é obrigatória", "Senha inválida"))
	.min(8, { message: "Senha deve ter no mínimo 8 caracteres" })
	.max(72, { message: "Senha deve ter no máximo 72 caracteres" })
	.regex(/[A-Z]/, { message: "Senha deve conter uma letra maiúscula" })
	.regex(/[a-z]/, { message: "Senha deve conter uma letra minúscula" })
	.regex(/\d/, { message: "Senha deve conter um número" })
	.regex(/[^a-zA-Z0-9]/, {
		message: "Senha deve conter um caractere especial",
	});

const passwordConfirmationSchema = z.string(
	fieldError("Confirmação de senha é obrigatória", "Confirmação inválida"),
);

const passwordsMatch = {
	message: "As senhas não coincidem",
	path: ["passwordConfirmation"],
};

const emailSchema = z.email({ error: "E-mail inválido" });

const phoneSchema = z
	.string(fieldError("Telefone é obrigatório", "Telefone inválido"))
	.min(10, { message: "Telefone inválido" })
	.max(20, { message: "Telefone inválido" });

const permissionSchema = z.enum(
	[UserPermission.READ_ONLY, UserPermission.ALL],
	fieldError("Permissão é obrigatória", "Permissão inválida"),
);

export const registerSchema = z
	.object({
		name: nameSchema,
		email: emailSchema,
		phone: phoneSchema,
		password: passwordSchema,
		passwordConfirmation: passwordConfirmationSchema,
	})
	.refine(
		(data) => data.password === data.passwordConfirmation,
		passwordsMatch,
	);

export const registerInvitedSchema = z
	.object({
		name: nameSchema,
		phone: phoneSchema,
		password: passwordSchema,
		passwordConfirmation: passwordConfirmationSchema,
	})
	.refine(
		(data) => data.password === data.passwordConfirmation,
		passwordsMatch,
	);

export const loginSchema = z.object({
	email: emailSchema,
	password: z.string(fieldError("Senha é obrigatória", "Senha inválida")),
	code: z.string().optional(),
	rememberMe: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
	email: emailSchema,
});

export const resetPasswordSchema = z
	.object({
		password: passwordSchema,
		passwordConfirmation: passwordConfirmationSchema,
	})
	.refine(
		(data) => data.password === data.passwordConfirmation,
		passwordsMatch,
	);

export const updateProfileSchema = z.object({
	name: nameSchema,
	email: emailSchema,
	phone: phoneSchema,
});

export const createInviteSchema = z.object({
	email: emailSchema,
	permission: permissionSchema,
});

export const updateUserSchema = z.object({
	permission: permissionSchema,
});

export const updatePhoneSchema = z.object({
	botAllowed: z.coerce.boolean(fieldError("É obrigatório", "Valor inválido")),
});

export const twoFactorEnableSchema = z.object({
	code: z
		.string(fieldError("Código é obrigatório", "Código inválido"))
		.regex(/^\d{6}$/, { message: "Código inválido" }),
});

export const twoFactorDisableSchema = z.object({
	code: z
		.string(fieldError("Código é obrigatório", "Código inválido"))
		.min(6, { message: "Código inválido" }),
});
