import { Database } from "@/kysely/types";
import { Kysely } from "kysely";

export async function seedCategory(db: Kysely<Database>) {
	console.log("Seeding category");

	const admin = await db
		.selectFrom("users")
		.where("email", "=", "admin@admin.com")
		.selectAll()
		.executeTakeFirst();

	if (!admin) {
		throw new Error("Admin user not found");
	}

	await db
		.insertInto("categories")
		.values([
			{
				name: "Casa",
				userId: admin.id,
				isDefault: true,
			},
			{
				name: "Carro",
				userId: admin.id,
				isDefault: true,
			},
			{
				name: "Comida",
				userId: admin.id,
				isDefault: true,
			},
			{
				name: "Eletrônicos",
				userId: admin.id,
				isDefault: true,
			},
			{
				name: "Outros",
				userId: admin.id,
				isDefault: true,
			},
		])
		.execute();

	console.log("User seeded");
}
