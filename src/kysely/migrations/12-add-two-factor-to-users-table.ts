import type { Kysely } from "kysely";
import { sql } from "kysely";
import type { Database } from "@/kysely/types";

const tableName = "users";

export async function up(db: Kysely<Database>): Promise<void> {
	await db.schema
		.alterTable(tableName)
		.addColumn("two_factor_enabled", "boolean", (col) =>
			col.notNull().defaultTo(sql`false`),
		)
		.execute();

	await db.schema
		.alterTable(tableName)
		.addColumn("two_factor_secret", "text")
		.execute();

	await db.schema
		.alterTable(tableName)
		.addColumn("two_factor_recovery_codes", "text")
		.execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
	await db.schema
		.alterTable(tableName)
		.dropColumn("two_factor_enabled")
		.execute();

	await db.schema
		.alterTable(tableName)
		.dropColumn("two_factor_secret")
		.execute();

	await db.schema
		.alterTable(tableName)
		.dropColumn("two_factor_recovery_codes")
		.execute();
}
