import type { Kysely } from "kysely";
import type { Database } from "@/kysely/types";

const tableName = "users";

export async function up(db: Kysely<Database>): Promise<void> {
	await db.schema
		.alterTable(tableName)
		.addColumn("phone", "text", (col) => col.notNull().defaultTo(""))
		.execute();

	await db.schema
		.alterTable(tableName)
		.addColumn("bot_allowed", "boolean", (col) => col.notNull().defaultTo(true))
		.execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
	await db.schema.alterTable(tableName).dropColumn("phone").execute();
	await db.schema.alterTable(tableName).dropColumn("bot_allowed").execute();
}
