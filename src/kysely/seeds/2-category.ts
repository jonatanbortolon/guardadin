import type { Kysely } from "kysely";
import type { Database } from "@/kysely/types";

export async function seedCategory(db: Kysely<Database>) {
	console.log("Seeding category");

	await db
		.insertInto("categories")
		.values([
			{
				name: "Casa",
				isDefault: true,
			},
			{
				name: "Carro",
				isDefault: true,
			},
			{
				name: "Comida",
				isDefault: true,
			},
			{
				name: "Eletrônicos",
				isDefault: true,
			},
			{
				name: "Outros",
				isDefault: true,
			},
		])
		.execute();

	console.log("Category seeded");
}
