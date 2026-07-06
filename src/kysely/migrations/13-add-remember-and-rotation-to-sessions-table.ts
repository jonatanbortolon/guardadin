import { type Kysely, sql } from "kysely";
import type { Database } from "@/kysely/types";

const tableName = "sessions";

export async function up(db: Kysely<Database>): Promise<void> {
	await db.schema
		.alterTable(tableName)
		.addColumn("remember_me", "boolean", (col) =>
			col.notNull().defaultTo(sql`false`),
		)
		.execute();

	await db.schema
		.alterTable(tableName)
		.addColumn("rotated_at", "timestamptz", (col) =>
			col.notNull().defaultTo(sql`now()`),
		)
		.execute();

	await db.schema
		.alterTable(tableName)
		.addColumn("updated_at", "timestamptz", (col) =>
			col.notNull().defaultTo(sql`now()`),
		)
		.execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
	await db.schema.alterTable(tableName).dropColumn("remember_me").execute();
	await db.schema.alterTable(tableName).dropColumn("rotated_at").execute();
	await db.schema.alterTable(tableName).dropColumn("updated_at").execute();
}
