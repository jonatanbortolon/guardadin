import { User } from "@/kysely/types/user";
import { env } from "@/libs/env";
import { kysely } from "@/libs/kysely";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { cache } from "react";

const secretKey = env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export const session = {
	async createSession(userId: User["id"]) {
		const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
		const session = await this.encrypt({ userId, expiresAt });
		const cookieStore = await cookies();

		cookieStore.set("session", session, {
			httpOnly: true,
			secure: env.NODE_ENV === "production",
			expires: expiresAt,
			sameSite: "lax",
			path: "/",
		});
	},
	async deleteSession() {
		const cookieStore = await cookies();

		cookieStore.delete("session");
	},
	async encrypt(payload: { userId: User["id"]; expiresAt: Date }) {
		return await new SignJWT(payload)
			.setProtectedHeader({ alg: "HS256" })
			.setIssuedAt()
			.setExpirationTime("7d")
			.sign(encodedKey);
	},
	async decrypt(session: string | undefined = "") {
		try {
			const { payload } = await jwtVerify(session, encodedKey, {
				algorithms: ["HS256"],
			});

			return payload;
		} catch (_error) {}
	},
	async getSession() {
		return await cache(async () => {
			const cookie = await cookies();
			const sessionCookie = cookie.get("session")?.value;
			const session = await this.decrypt(sessionCookie);

			if (!session?.userId) {
				return { userId: null };
			}

			return { userId: session.userId as number };
		})();
	},
	async getUserSession() {
		const { userId } = await this.getSession();

		if (!userId) {
			return null;
		}

		return (
			(await kysely
				.selectFrom("users")
				.select(["id", "name", "phone", "email", "createdAt", "updatedAt"])
				.where("id", "=", userId)
				.executeTakeFirst()) || null
		);
	},
};
