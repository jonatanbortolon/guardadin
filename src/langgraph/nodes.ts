import { ToolNode } from "@langchain/langgraph/prebuilt";
import { StateAnnotation } from "@/langgraph/state";
import { llm } from "@/langgraph/llm";
import { tools } from "@/langgraph/tools";

export const toolNode = new ToolNode(tools);

export async function llmCallNode(state: typeof StateAnnotation.State) {
	const result = await llm.invoke(state.messages);

	return {
		messages: [result],
	};
}
