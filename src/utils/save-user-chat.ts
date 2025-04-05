import { Database } from "@/kysely/types";
import { kysely } from "@/libs/kysely";
import { Transaction } from "kysely";

export async function saveUserMessage(
	userId: number,
	content: string,
	opts?: {
		trx: Transaction<Database>;
	},
) {
	await (opts?.trx || kysely)
		.insertInto("chat_histories")
		.values({
			userId,
			role: "user",
			text: { content },
		})
		.execute();
}
