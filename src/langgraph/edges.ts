import { isAIMessage } from "@langchain/core/messages";
import type { StateAnnotation } from "@/langgraph/state";

export function routeAfterAgent(
	state: typeof StateAnnotation.State,
): "tools" | "respond" {
	const lastMessage = state.messages.at(-1);

	if (
		lastMessage &&
		isAIMessage(lastMessage) &&
		lastMessage.tool_calls?.length
	) {
		return "tools";
	}

	return "respond";
}
