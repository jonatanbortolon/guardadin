import {
	preInitializeConditionalEdge,
	shouldContinueConditionalEdge,
} from "@/langgraph/conditional-edges";
import { llmCallNode, toolNode } from "@/langgraph/nodes";
import { StateAnnotation } from "@/langgraph/state";
import { StateGraph } from "@langchain/langgraph";

const agentBuilder = new StateGraph(StateAnnotation)
	.addNode("llmCall", llmCallNode)
	.addNode("tools", toolNode)

	.addEdge("tools", "__end__")

	.addConditionalEdges("__start__", preInitializeConditionalEdge, {
		LLMCall: "llmCall",
		__end__: "__end__",
	})
	.addConditionalEdges("llmCall", shouldContinueConditionalEdge, {
		Action: "tools",
		__end__: "__end__",
	})

	.compile();

export const langgraph = {
	agentBuilder,
};
