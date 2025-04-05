import { Database } from "@/kysely/types";
import { Kysely } from "kysely";

export async function seedBankAccount(db: Kysely<Database>) {
	console.log("Seeding bank account");

	const admin = await db
		.selectFrom("users")
		.where("email", "=", "admin@admin.com")
		.selectAll()
		.executeTakeFirst();

	if (!admin) {
		throw new Error("Admin user not found");
	}

	await db
		.insertInto("bank_accounts")
		.values([
			{
				isDefault: true,
				name: "Nubank",
				userId: admin.id,
			},
			{
				isDefault: false,
				name: "PicPay",
				userId: admin.id,
			},
		])
		.execute();

	console.log("Bank account seeded");
}
