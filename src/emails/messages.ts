import type { Locale } from "@/i18n/config";

export type EmailMessages = {
	fromLocalPart: string;
	confirmSubject: string;
	confirmPreview: string;
	confirmHeading: string;
	confirmGreeting: (name: string) => string;
	confirmBody: string;
	confirmButton: string;
	confirmIgnore: string;
	confirmFallback: string;
	resetSubject: string;
	resetPreview: string;
	resetHeading: string;
	resetGreeting: (name: string) => string;
	resetBody: string;
	resetButton: string;
	resetFallback: string;
	resetExpiry: string;
	resetIgnore: string;
	inviteSubject: string;
	invitePreview: string;
	inviteHeading: string;
	inviteBody: string;
	inviteButton: string;
	inviteIgnore: string;
	inviteFallback: string;
};

export const emailMessages: Record<Locale, EmailMessages> = {
	"pt-BR": {
		fromLocalPart: "contato",
		confirmSubject: "Confirme seu e-mail — GuardaDin",
		confirmPreview: "Confirme seu e-mail para ativar sua conta",
		confirmHeading: "Bem-vindo ao GuardaDin",
		confirmGreeting: (name) => `Olá, ${name}!`,
		confirmBody:
			"Falta pouco para começar. Confirme seu e-mail clicando no botão abaixo para ativar sua conta.",
		confirmButton: "Confirmar e-mail",
		confirmIgnore:
			"Se você não criou esta conta, pode ignorar este e-mail com segurança.",
		confirmFallback: "Ou copie e cole este link no seu navegador:",
		resetSubject: "Redefinição de senha — GuardaDin",
		resetPreview: "Redefina a senha da sua conta",
		resetHeading: "Redefinir senha",
		resetGreeting: (name) => `Olá, ${name}!`,
		resetBody:
			"Recebemos um pedido para redefinir sua senha. Clique no botão abaixo para criar uma nova senha.",
		resetButton: "Redefinir senha",
		resetFallback: "Ou copie e cole este link no seu navegador:",
		resetExpiry: "Este link expira em 1 hora.",
		resetIgnore:
			"Se você não solicitou isso, pode ignorar este e-mail com segurança.",
		inviteSubject: "Você foi convidado — GuardaDin",
		invitePreview: "Crie sua conta no GuardaDin",
		inviteHeading: "Você foi convidado",
		inviteBody:
			"Você foi convidado para usar o GuardaDin. Clique no botão abaixo para criar sua conta.",
		inviteButton: "Criar minha conta",
		inviteIgnore:
			"Se você não esperava este convite, pode ignorar este e-mail com segurança.",
		inviteFallback: "Ou copie e cole este link no seu navegador:",
	},
	es: {
		fromLocalPart: "contacto",
		confirmSubject: "Confirma tu correo — GuardaDin",
		confirmPreview: "Confirma tu correo para activar tu cuenta",
		confirmHeading: "Bienvenido a GuardaDin",
		confirmGreeting: (name) => `¡Hola, ${name}!`,
		confirmBody:
			"Ya casi está listo. Confirma tu correo haciendo clic en el botón de abajo para activar tu cuenta.",
		confirmButton: "Confirmar correo",
		confirmIgnore:
			"Si no creaste esta cuenta, puedes ignorar este correo de forma segura.",
		confirmFallback: "O copia y pega este enlace en tu navegador:",
		resetSubject: "Restablecer contraseña — GuardaDin",
		resetPreview: "Restablece la contraseña de tu cuenta",
		resetHeading: "Restablecer contraseña",
		resetGreeting: (name) => `¡Hola, ${name}!`,
		resetBody:
			"Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón de abajo para crear una nueva.",
		resetButton: "Restablecer contraseña",
		resetFallback: "O copia y pega este enlace en tu navegador:",
		resetExpiry: "Este enlace caduca en 1 hora.",
		resetIgnore:
			"Si no solicitaste esto, puedes ignorar este correo de forma segura.",
		inviteSubject: "Has sido invitado — GuardaDin",
		invitePreview: "Crea tu cuenta en GuardaDin",
		inviteHeading: "Has sido invitado",
		inviteBody:
			"Has sido invitado a usar GuardaDin. Haz clic en el botón de abajo para crear tu cuenta.",
		inviteButton: "Crear mi cuenta",
		inviteIgnore:
			"Si no esperabas esta invitación, puedes ignorar este correo de forma segura.",
		inviteFallback: "O copia y pega este enlace en tu navegador:",
	},
	en: {
		fromLocalPart: "contact",
		confirmSubject: "Confirm your email — GuardaDin",
		confirmPreview: "Confirm your email to activate your account",
		confirmHeading: "Welcome to GuardaDin",
		confirmGreeting: (name) => `Hi, ${name}!`,
		confirmBody:
			"You're almost there. Confirm your email by clicking the button below to activate your account.",
		confirmButton: "Confirm email",
		confirmIgnore:
			"If you didn't create this account, you can safely ignore this email.",
		confirmFallback: "Or copy and paste this link into your browser:",
		resetSubject: "Reset your password — GuardaDin",
		resetPreview: "Reset your account password",
		resetHeading: "Reset password",
		resetGreeting: (name) => `Hi, ${name}!`,
		resetBody:
			"We received a request to reset your password. Click the button below to create a new one.",
		resetButton: "Reset password",
		resetFallback: "Or copy and paste this link into your browser:",
		resetExpiry: "This link expires in 1 hour.",
		resetIgnore:
			"If you didn't request this, you can safely ignore this email.",
		inviteSubject: "You've been invited — GuardaDin",
		invitePreview: "Create your GuardaDin account",
		inviteHeading: "You've been invited",
		inviteBody:
			"You've been invited to use GuardaDin. Click the button below to create your account.",
		inviteButton: "Create my account",
		inviteIgnore:
			"If you weren't expecting this invitation, you can safely ignore this email.",
		inviteFallback: "Or copy and paste this link into your browser:",
	},
};
