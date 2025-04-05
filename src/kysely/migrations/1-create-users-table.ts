import { Database } from "@/kysely/types";
import { Kysely, sql } from "kysely";

const tableName = "users";

export async function up(db: Kysely<Database>): Promise<void> {
	db.schema
		.createTable(tableName)
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("name", "text", (col) => col.notNull())
		.addColumn("phone", "text", (col) => col.notNull())
		.addColumn("email", "text", (col) => col.notNull().unique())
		.addColumn("password", "text", (col) => col.notNull())
		.addColumn("created_at", "timestamptz", (col) =>
			col.defaultTo(sql`now()`).notNull(),
		)
		.addColumn("updated_at", "timestamptz")
		.execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
	db.schema.dropTable(tableName).execute();
}
