import { Database } from "@/kysely/types";
import { Kysely, sql } from "kysely";

const tableName = "transactions";

export async function up(db: Kysely<Database>): Promise<void> {
	db.schema
		.createTable(tableName)
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("user_id", "integer", (col) =>
			col.notNull().references("users.id").onDelete("cascade"),
		)
		.addColumn("total_parcels", "integer", (col) => col.notNull())
		.addColumn("description", "text", (col) => col.notNull())
		.addColumn("total", "decimal", (col) => col.notNull())
		.addColumn("type", "text", (col) => col.notNull())
		.addColumn("bought_at", "timestamptz", (col) => col.notNull())
		.addColumn("category_id", "integer", (col) =>
			col.references("categories.id").onDelete("set null"),
		)
		.addColumn("bank_account_id", "integer", (col) =>
			col.references("bank_accounts.id").onDelete("set null"),
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
