import { loadEnvConfig } from "@next/env";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

export async function bootstrap() {
	console.log("Starting reset");

	const db = await import("@/libs/kysely").then(({ kysely }) => kysely);

	await db.schema
		.dropTable("transaction_payments")
		.execute()
		.catch(() =>
			console.log("Table transaction_payments already been deleted"),
		);
	await db.schema
		.dropTable("transactions")
		.execute()
		.catch(() => console.log("Table transactions already been deleted"));
	await db.schema
		.dropTable("bank_accounts")
		.execute()
		.catch(() => console.log("Table bank_accounts already been deleted"));
	await db.schema
		.dropTable("categories")
		.execute()
		.catch(() => console.log("Table categories already been deleted"));
	await db.schema
		.dropTable("chat_histories")
		.execute()
		.catch(() => console.log("Table chat_histories already been deleted"));
	await db.schema
		.dropTable("users")
		.execute()
		.catch(() => console.log("Table users already been deleted"));
	await db.schema
		.dropTable("kysely_migration")
		.execute()
		.catch(() => console.log("Table kysely_migration already been deleted"));
	await db.schema
		.dropTable("kysely_migration_lock")
		.execute()
		.catch(() =>
			console.log("Table kysely_migration_lock already been deleted"),
		);

	await db.destroy();

	console.log("Reset finished");
}

bootstrap();
