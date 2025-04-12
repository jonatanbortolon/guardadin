import { llm } from "@/langgraph/llm";
import { StateAnnotation } from "@/langgraph/state";
import { tools } from "@/langgraph/tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";

export const toolNode = new ToolNode(tools);

export async function llmCallNode(state: typeof StateAnnotation.State) {
	const result = await llm.invoke(state.messages);

	return {
		messages: [result],
	};
}
