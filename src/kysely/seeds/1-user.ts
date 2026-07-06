import type { Kysely } from "kysely";
import { UserPermission } from "@/enums/user-permission";
import type { Database } from "@/kysely/types";
import { hashPassword } from "@/libs/password";

export async function seedUser(db: Kysely<Database>) {
	console.log("Seeding admin user");

	const existingAdmin = await db
		.selectFrom("users")
		.select("id")
		.where("isAdmin", "=", true)
		.executeTakeFirst();

	if (existingAdmin) {
		console.log("An admin already exists, skipping");
		return;
	}

	await db
		.insertInto("users")
		.values({
			name: "Admin",
			email: "admin@admin.com",
			phone: "5511999999999",
			passwordHash: await hashPassword("admin"),
			isAdmin: true,
			permission: UserPermission.ALL,
			emailConfirmedAt: new Date(),
		})
		.execute();

	console.log("Admin user seeded");
}
