import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import { ConfirmEmail } from "@/emails/confirm-email";
import { InviteEmail } from "@/emails/invite";
import { emailMessages } from "@/emails/messages";
import { ResetPasswordEmail } from "@/emails/reset-password";
import type { Locale } from "@/i18n/config";
import { env } from "@/libs/env";

const transporter = nodemailer.createTransport({
	host: env.EMAIL_HOST,
	port: env.EMAIL_PORT,
	secure: env.EMAIL_SECURE,
	auth: env.EMAIL_USER
		? { user: env.EMAIL_USER, pass: env.EMAIL_PASSWORD }
		: undefined,
});

function buildFrom(locale: Locale) {
	const domain = new URL(env.APP_URL).hostname;

	return `"GuardaDin" <${emailMessages[locale].fromLocalPart}@${domain}>`;
}

export async function sendConfirmationEmail(params: {
	to: string;
	name: string;
	token: string;
	locale: Locale;
}) {
	const messages = emailMessages[params.locale];
	const confirmUrl = `${env.APP_URL}/confirm-email/${params.token}`;

	const html = await render(
		ConfirmEmail({
			name: params.name,
			confirmUrl,
			locale: params.locale,
			messages,
		}),
	);

	await transporter.sendMail({
		from: buildFrom(params.locale),
		to: params.to,
		subject: messages.confirmSubject,
		html,
	});
}

export async function sendPasswordResetEmail(params: {
	to: string;
	name: string;
	token: string;
	locale: Locale;
}) {
	const messages = emailMessages[params.locale];
	const resetUrl = `${env.APP_URL}/reset-password/${params.token}`;

	const html = await render(
		ResetPasswordEmail({
			name: params.name,
			resetUrl,
			locale: params.locale,
			messages,
		}),
	);

	await transporter.sendMail({
		from: buildFrom(params.locale),
		to: params.to,
		subject: messages.resetSubject,
		html,
	});
}

export async function sendInviteEmail(params: {
	to: string;
	registerUrl: string;
	locale: Locale;
}) {
	const messages = emailMessages[params.locale];

	const html = await render(
		InviteEmail({
			registerUrl: params.registerUrl,
			locale: params.locale,
			messages,
		}),
	);

	await transporter.sendMail({
		from: buildFrom(params.locale),
		to: params.to,
		subject: messages.inviteSubject,
		html,
	});
}
