import { type Kysely, sql } from "kysely";
import type { Database } from "@/kysely/types";

const tableName = "users";

export async function up(db: Kysely<Database>): Promise<void> {
	await db.schema
		.createTable(tableName)
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("email", "text", (col) => col.notNull().unique())
		.addColumn("name", "text", (col) => col.notNull())
		.addColumn("password_hash", "text", (col) => col.notNull())
		.addColumn("is_admin", "boolean", (col) => col.notNull().defaultTo(false))
		.addColumn("permission", "text", (col) => col.notNull())
		.addColumn("email_confirmed_at", "timestamptz")
		.addColumn("email_confirmation_token", "text")
		.addColumn("created_at", "timestamptz", (col) =>
			col.defaultTo(sql`now()`).notNull(),
		)
		.addColumn("updated_at", "timestamptz")
		.execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
	await db.schema.dropTable(tableName).execute();
}
