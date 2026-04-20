import {
	preInitializeConditionalEdge,
	shouldContinueConditionalEdge,
} from "@/langgraph/conditional-edges";
import { llmCallNode, toolNode } from "@/langgraph/nodes";
import { StateAnnotation } from "@/langgraph/state";
import { END, START, StateGraph } from "@langchain/langgraph";

const agentBuilder = new StateGraph(StateAnnotation)
	.addNode("llmCall", llmCallNode)
	.addNode("tools", toolNode)

	.addEdge(START, "llmCall")
	.addEdge("tools", END)

	.addConditionalEdges("__start__", preInitializeConditionalEdge, {
		LLMCall: "llmCall",
	})
	.addConditionalEdges("llmCall", shouldContinueConditionalEdge, {
		Action: "tools",
	})

	.compile();

export const langgraph = {
	agentBuilder,
};
