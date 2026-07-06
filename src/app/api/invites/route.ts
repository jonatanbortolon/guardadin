import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { type Locale, resolveLocale } from "@/i18n/config";
import { jsonError } from "@/libs/api";
import { requireAdmin } from "@/libs/auth";
import { env } from "@/libs/env";
import { kysely } from "@/libs/kysely";
import { sendInviteEmail } from "@/libs/mailer";
import { createInviteSchema } from "@/schemas/auth";

function withRegisterUrl(invite: { token: string }) {
	return { ...invite, registerUrl: `${env.APP_URL}/register/${invite.token}` };
}

async function trySendInvite(to: string, registerUrl: string, locale: Locale) {
	try {
		await sendInviteEmail({ to, registerUrl, locale });
	} catch (error) {
		console.error(error);
	}
}

export async function POST(request: Request) {
	const admin = await requireAdmin();

	if (admin instanceof NextResponse) {
		return admin;
	}

	const body = await request.json().catch(() => null);
	const validatedFields = createInviteSchema.safeParse(body);

	if (!validatedFields.success) {
		return NextResponse.json(
			{ errors: validatedFields.error.flatten().fieldErrors },
			{ status: 422 },
		);
	}

	const { email, permission } = validatedFields.data;
	const locale = resolveLocale(body?.locale);

	const existingUser = await kysely
		.selectFrom("users")
		.select("id")
		.where("email", "=", email)
		.executeTakeFirst();

	if (existingUser) {
		return jsonError("Já existe um usuário com este e-mail", 409);
	}

	const existingInvite = await kysely
		.selectFrom("invites")
		.selectAll()
		.where("email", "=", email)
		.executeTakeFirst();

	if (existingInvite) {
		if (existingInvite.usedAt) {
			return jsonError("Este e-mail já foi utilizado em um convite", 409);
		}

		const invite = withRegisterUrl(existingInvite);
		await trySendInvite(email, invite.registerUrl, locale);

		return NextResponse.json(invite, { status: 200 });
	}

	try {
		const created = await kysely
			.insertInto("invites")
			.returningAll()
			.values({ token: randomUUID(), email, permission })
			.executeTakeFirstOrThrow();

		const invite = withRegisterUrl(created);
		await trySendInvite(email, invite.registerUrl, locale);

		return NextResponse.json(invite, { status: 201 });
	} catch (error) {
		console.error(error);
		return jsonError("Tivemos um problema no servidor", 500);
	}
}
