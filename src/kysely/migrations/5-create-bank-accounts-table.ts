import { Database } from "@/kysely/types";
import { Kysely, sql } from "kysely";

const tableName = "bank_accounts";

export async function up(db: Kysely<Database>): Promise<void> {
	db.schema
		.createTable(tableName)
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("name", "text", (col) => col.notNull())
		.addColumn("is_default", "boolean", (col) => col.notNull())
		.addColumn("user_id", "integer", (col) =>
			col.notNull().references("users.id").onDelete("cascade"),
		)
		.addColumn("created_at", "timestamptz", (col) =>
			col.defaultTo(sql`now()`).notNull(),
		)
		.addColumn("updated_at", "timestamptz")
		.execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
	db.schema.dropTable(tableName).execute();
}
