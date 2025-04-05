import { Database } from "@/kysely/types";
import { Kysely, sql } from "kysely";

const tableName = "transaction_payments";

export async function up(db: Kysely<Database>): Promise<void> {
	db.schema
		.createTable(tableName)
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("transaction_id", "integer", (col) =>
			col.notNull().references("transactions.id").onDelete("cascade"),
		)
		.addColumn("amount", "decimal", (col) => col.notNull())
		.addColumn("parcel_number", "integer", (col) => col.notNull())
		.addColumn("created_at", "timestamptz", (col) =>
			col.defaultTo(sql`now()`).notNull(),
		)
		.addColumn("updated_at", "timestamptz")
		.execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
	db.schema.dropTable(tableName).execute();
}
