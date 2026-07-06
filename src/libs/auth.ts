import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { User } from "@/kysely/types/user";
import { jsonError } from "@/libs/api";
import { env } from "@/libs/env";
import { kysely } from "@/libs/kysely";

export const SESSION_COOKIE = "guardadin_session";

const REMEMBER_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;
const ROTATION_INTERVAL_MS = 24 * 60 * 60 * 1000;
const ROTATION_GRACE_MS = 60 * 1000;

function sessionDuration(rememberMe: boolean) {
	return rememberMe ? REMEMBER_DURATION_MS : SESSION_DURATION_MS;
}

async function setSessionCookie(
	id: string,
	rememberMe: boolean,
	expiresAt: Date,
) {
	const cookieStore = await cookies();

	cookieStore.set(SESSION_COOKIE, id, {
		httpOnly: true,
		secure: env.NODE_ENV !== "development",
		sameSite: "lax",
		path: "/",
		...(rememberMe ? { expires: expiresAt } : {}),
	});
}

export async function createSession(userId: number, rememberMe = false) {
	const id = randomUUID();
	const expiresAt = new Date(Date.now() + sessionDuration(rememberMe));

	await kysely
		.insertInto("sessions")
		.values({ id, userId, rememberMe, expiresAt, rotatedAt: new Date() })
		.execute();

	await setSessionCookie(id, rememberMe, expiresAt);
}

async function rotateSession(
	oldId: string,
	userId: number,
	rememberMe: boolean,
) {
	const id = randomUUID();
	const now = Date.now();
	const expiresAt = new Date(now + sessionDuration(rememberMe));

	await kysely
		.insertInto("sessions")
		.values({ id, userId, rememberMe, expiresAt, rotatedAt: new Date(now) })
		.execute();

	await kysely
		.updateTable("sessions")
		.set({ expiresAt: new Date(now + ROTATION_GRACE_MS) })
		.where("id", "=", oldId)
		.execute();

	await setSessionCookie(id, rememberMe, expiresAt);
}

export async function destroySession() {
	const cookieStore = await cookies();
	const token = cookieStore.get(SESSION_COOKIE)?.value;

	if (token) {
		await kysely.deleteFrom("sessions").where("id", "=", token).execute();
	}

	cookieStore.delete(SESSION_COOKIE);
}

type SessionMeta = {
	id: string;
	rememberMe: boolean;
	rotatedAt: Date;
};

async function readSession(): Promise<{
	user: User;
	session: SessionMeta;
} | null> {
	const cookieStore = await cookies();
	const token = cookieStore.get(SESSION_COOKIE)?.value;

	if (!token) {
		return null;
	}

	const row = await kysely
		.selectFrom("sessions")
		.innerJoin("users", "users.id", "sessions.userId")
		.where("sessions.id", "=", token)
		.selectAll("users")
		.select([
			"sessions.rememberMe as sessionRememberMe",
			"sessions.rotatedAt as sessionRotatedAt",
			"sessions.expiresAt as sessionExpiresAt",
		])
		.executeTakeFirst();

	if (!row) {
		return null;
	}

	if (new Date(row.sessionExpiresAt) < new Date()) {
		await kysely.deleteFrom("sessions").where("id", "=", token).execute();
		return null;
	}

	const {
		sessionRememberMe,
		sessionRotatedAt,
		sessionExpiresAt: _sessionExpiresAt,
		...user
	} = row;

	return {
		user,
		session: {
			id: token,
			rememberMe: sessionRememberMe,
			rotatedAt: new Date(sessionRotatedAt),
		},
	};
}

export async function getSessionUser(): Promise<User | null> {
	const result = await readSession();

	return result?.user ?? null;
}

export async function touchSession(): Promise<User | null> {
	const result = await readSession();

	if (!result) {
		return null;
	}

	const { user, session } = result;

	if (
		session.rememberMe &&
		Date.now() - session.rotatedAt.getTime() >= ROTATION_INTERVAL_MS
	) {
		await rotateSession(session.id, user.id, session.rememberMe);
	}

	return user;
}

export async function requireUser(): Promise<User | NextResponse> {
	const user = await getSessionUser();

	if (!user) {
		return jsonError("Não autenticado", 401);
	}

	if (!user.emailConfirmedAt) {
		return jsonError("E-mail não confirmado", 403);
	}

	return user;
}

export async function requireAdmin(): Promise<User | NextResponse> {
	const result = await requireUser();

	if (result instanceof NextResponse) {
		return result;
	}

	if (!result.isAdmin) {
		return jsonError("Acesso restrito a administradores", 403);
	}

	return result;
}

export async function requireWritePermission(): Promise<User | NextResponse> {
	const result = await requireUser();

	if (result instanceof NextResponse) {
		return result;
	}

	if (!result.isAdmin && result.permission !== "ALL") {
		return jsonError("Sem permissão para esta ação", 403);
	}

	return result;
}
