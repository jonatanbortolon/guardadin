import {
	AIMessage,
	type BaseMessage,
	HumanMessage,
} from "@langchain/core/messages";
import { kysely } from "@/libs/kysely";

const HISTORY_LIMIT = 20;

export async function loadHistory(phoneNumber: string): Promise<BaseMessage[]> {
	const rows = await kysely
		.selectFrom("chat_histories")
		.select(["role", "text"])
		.where("phoneNumber", "=", phoneNumber)
		.orderBy("createdAt", "desc")
		.limit(HISTORY_LIMIT)
		.execute();

	return rows.reverse().flatMap((row): BaseMessage[] => {
		const content = (row.text as { content?: unknown }).content;

		if (typeof content !== "string") {
			return [];
		}

		if (row.role === "user") {
			return [new HumanMessage(content)];
		}

		if (row.role === "assistant") {
			return [new AIMessage(content)];
		}

		return [];
	});
}

export async function saveMessage(
	phoneNumber: string,
	role: "user" | "assistant",
	content: string,
) {
	await kysely
		.insertInto("chat_histories")
		.values({ phoneNumber, role, text: { content } })
		.execute();
}
