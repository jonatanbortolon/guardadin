import { seedUser } from "@/kysely/seeds/1-user";
import { seedCategory } from "@/kysely/seeds/2-category";
import { seedBankAccount } from "@/kysely/seeds/3-bank-account";
import { loadEnvConfig } from "@next/env";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function bootstrap() {
	console.log("Starting seeding");

	const db = await import("@/libs/kysely").then(({ kysely }) => kysely);

	await seedUser(db);
	await seedCategory(db);
	await seedBankAccount(db);

	console.log("Seeding finished");
}

bootstrap();
