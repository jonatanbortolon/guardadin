import { GENERIC_ERROR_MESSAGE } from "@/consts/whatsapp/messages/generic-error";
import { MAX_TOKENS_EXCEEDED } from "@/consts/whatsapp/messages/max-tokens-exceeded";
import { StateAnnotation } from "@/langgraph/state";
import { kysely } from "@/libs/kysely";
import { whatsapp } from "@/libs/whatsapp";
import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { Tiktoken } from "js-tiktoken/lite";
import o200k_base from "js-tiktoken/ranks/o200k_base";
import { ResultAsync } from "neverthrow";

export async function preInitializeConditionalEdge(
	state: typeof StateAnnotation.State,
	annotation: LangGraphRunnableConfig,
) {
	const metadata = annotation.metadata;

	const phoneNumber = metadata?.phoneNumber as string;

	const messages = state.messages;

	const lastMessage = messages.at(-1);

	if (!lastMessage) {
		await whatsapp.sendMessage(phoneNumber, GENERIC_ERROR_MESSAGE);

		return "__end__";
	}

	const userId = metadata?.userId;

	if (!userId || typeof userId !== "number") {
		await whatsapp.sendMessage(phoneNumber, GENERIC_ERROR_MESSAGE);

		return "__end__";
	}

	const userMessage = lastMessage.content as string;

	const encoding = new Tiktoken(o200k_base);
	const tokens = encoding.encode(userMessage).length;

	if (tokens > 50) {
		await whatsapp.sendMessage(phoneNumber, MAX_TOKENS_EXCEEDED);

		return "__end__";
	}

	const userChatHistoryNT = await ResultAsync.fromPromise(
		kysely
			.insertInto("chat_histories")
			.values({
				userId,
				role: "user",
				text: { content: userMessage },
			})
			.returningAll()
			.execute(),
		console.error,
	);

	if (userChatHistoryNT.isErr()) {
		await whatsapp.sendMessage(phoneNumber, GENERIC_ERROR_MESSAGE);

		return "__end__";
	}

	return "LLMCall";
}

export async function shouldContinueConditionalEdge(
	state: typeof StateAnnotation.State,
	annotation: LangGraphRunnableConfig,
) {
	const messages = state.messages;
	const lastMessage = messages.at(-1);

	const userId = annotation.metadata?.userId as number;

	if (!lastMessage) {
		return "__end__";
	}

	if ("tool_calls" in lastMessage && lastMessage.tool_calls?.length) {
		for await (const toolCall of lastMessage.tool_calls) {
			await ResultAsync.fromPromise(
				kysely
					.insertInto("chat_histories")
					.values({
						userId,
						role: "tool",
						text: { content: toolCall },
					})
					.execute(),
				console.error,
			);
		}

		return "Action";
	}

	return "__end__";
}
