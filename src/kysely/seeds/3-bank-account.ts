import type { Kysely } from "kysely";
import type { Database } from "@/kysely/types";

export async function seedBankAccount(db: Kysely<Database>) {
	console.log("Seeding bank account");

	await db
		.insertInto("bank_accounts")
		.values([
			{
				isDefault: true,
				name: "Nubank",
			},
			{
				isDefault: false,
				name: "PicPay",
			},
		])
		.execute();

	console.log("Bank account seeded");
}
