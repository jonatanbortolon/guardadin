import { type Kysely, sql } from "kysely";
import type { Database } from "@/kysely/types";

const tableName = "sessions";

export async function up(db: Kysely<Database>): Promise<void> {
	await db.schema
		.createTable(tableName)
		.addColumn("id", "text", (col) => col.primaryKey())
		.addColumn("user_id", "integer", (col) =>
			col.notNull().references("users.id").onDelete("cascade"),
		)
		.addColumn("expires_at", "timestamptz", (col) => col.notNull())
		.addColumn("created_at", "timestamptz", (col) =>
			col.defaultTo(sql`now()`).notNull(),
		)
		.execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
	await db.schema.dropTable(tableName).execute();
}
