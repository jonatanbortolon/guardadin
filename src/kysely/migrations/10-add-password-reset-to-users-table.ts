import type { Kysely } from "kysely";
import type { Database } from "@/kysely/types";

const tableName = "users";

export async function up(db: Kysely<Database>): Promise<void> {
	await db.schema
		.alterTable(tableName)
		.addColumn("password_reset_token", "text")
		.execute();

	await db.schema
		.alterTable(tableName)
		.addColumn("password_reset_expires_at", "timestamptz")
		.execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
	await db.schema
		.alterTable(tableName)
		.dropColumn("password_reset_token")
		.execute();

	await db.schema
		.alterTable(tableName)
		.dropColumn("password_reset_expires_at")
		.execute();
}
