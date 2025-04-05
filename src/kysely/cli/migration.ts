import { promises as fs } from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { FileMigrationProvider, Migrator } from "kysely";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function migrateToLatest() {
	const db = await import("@/libs/kysely").then(({ kysely }) => kysely);

	const migrator = new Migrator({
		db,
		provider: new FileMigrationProvider({
			fs,
			path,
			migrationFolder: path.join(__dirname, "..", "migrations"),
		}),
	});

	const { error, results } = await migrator.migrateToLatest();

	for await (const it of results || []) {
		if (it.status === "Success") {
			console.log(`migration "${it.migrationName}" was executed successfully`);
		} else if (it.status === "Error") {
			console.error(`failed to execute migration "${it.migrationName}"`);
		}
	}

	if (error) {
		console.error("failed to migrate");
		console.error(error);
		process.exit(1);
	}

	await db.destroy();
}

migrateToLatest();
