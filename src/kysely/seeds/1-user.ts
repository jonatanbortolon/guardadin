import { Database } from "@/kysely/types";
import bcrypt from "bcryptjs";
import { Kysely } from "kysely";

export async function seedUser(db: Kysely<Database>) {
	console.log("Seeding user");

	await db
		.insertInto("users")
		.values([
			{
				name: "Admin",
				phone: "5599999999999",
				email: "admin@admin.com",
				password: await bcrypt.hash("admin", 10),
			},
		])
		.execute();

	console.log("User seeded");
}
