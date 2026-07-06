import type { BaseMessage } from "@langchain/core/messages";
import type { LangGraphRunnableConfig } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { GENERIC_ERROR_MESSAGE } from "@/consts/whatsapp/messages/generic-error";
import { llm } from "@/langgraph/llm";
import { saveMessage } from "@/langgraph/memory";
import type { StateAnnotation } from "@/langgraph/state";
import { tools } from "@/langgraph/tools";
import { whatsapp } from "@/libs/whatsapp";

export const toolNode = new ToolNode(tools);

export async function agentNode(state: typeof StateAnnotation.State) {
	const result = await llm.invoke(state.messages);

	return { messages: [result] };
}

function messageText(message: BaseMessage): string {
	if (typeof message.content === "string") {
		return message.content;
	}

	return message.content
		.map((part) => (part.type === "text" ? part.text : ""))
		.join("")
		.trim();
}

export async function respondNode(
	state: typeof StateAnnotation.State,
	config: LangGraphRunnableConfig,
) {
	const phoneNumber = config.metadata?.phoneNumber as string;
	const lastMessage = state.messages.at(-1);

	const text = lastMessage ? messageText(lastMessage) : "";
	const reply = text || GENERIC_ERROR_MESSAGE;

	await whatsapp.sendMessage(phoneNumber, reply);
	await saveMessage(phoneNumber, "assistant", reply);

	return {};
}
