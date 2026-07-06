import { type Kysely, sql } from "kysely";
import type { Database } from "@/kysely/types";

const tableName = "invites";

export async function up(db: Kysely<Database>): Promise<void> {
	await db.schema
		.createTable(tableName)
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("token", "text", (col) => col.notNull().unique())
		.addColumn("email", "text", (col) => col.notNull().unique())
		.addColumn("permission", "text", (col) => col.notNull())
		.addColumn("used_at", "timestamptz")
		.addColumn("created_at", "timestamptz", (col) =>
			col.defaultTo(sql`now()`).notNull(),
		)
		.addColumn("updated_at", "timestamptz")
		.execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
	await db.schema.dropTable(tableName).execute();
}
