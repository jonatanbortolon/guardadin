import { Database } from "@/kysely/types";
import { kysely } from "@/libs/kysely";
import { Transaction } from "kysely";
import OpenAI from "openai";

export async function saveToolMessage(
	userId: number,
	content: OpenAI.Chat.Completions.ChatCompletionMessageToolCall.Function,
	opts?: {
		trx: Transaction<Database>;
	},
) {
	await (opts?.trx || kysely)
		.insertInto("chat_histories")
		.values({
			userId,
			role: "tool",
			text: { content },
		})
		.execute();
}
