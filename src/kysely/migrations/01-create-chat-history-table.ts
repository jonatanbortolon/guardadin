import { type Kysely, sql } from "kysely";
import type { Database } from "@/kysely/types";

const tableName = "chat_histories";

export async function up(db: Kysely<Database>): Promise<void> {
	db.schema
		.createTable(tableName)
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("phone_number", "text", (col) => col.notNull())
		.addColumn("role", "text", (col) => col.notNull())
		.addColumn("text", "jsonb", (col) => col.notNull())
		.addColumn("created_at", "timestamptz", (col) =>
			col.defaultTo(sql`now()`).notNull(),
		)
		.addColumn("updated_at", "timestamptz")
		.execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
	db.schema.dropTable(tableName).execute();
}
