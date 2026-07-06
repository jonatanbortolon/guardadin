import { END, START, StateGraph } from "@langchain/langgraph";
import { routeAfterAgent } from "@/langgraph/edges";
import { agentNode, respondNode, toolNode } from "@/langgraph/nodes";
import { StateAnnotation } from "@/langgraph/state";

export const agent = new StateGraph(StateAnnotation)
	.addNode("agent", agentNode)
	.addNode("tools", toolNode)
	.addNode("respond", respondNode)

	.addEdge(START, "agent")
	.addConditionalEdges("agent", routeAfterAgent, {
		tools: "tools",
		respond: "respond",
	})
	.addEdge("tools", "agent")
	.addEdge("respond", END)

	.compile();
