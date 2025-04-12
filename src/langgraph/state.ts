import {
	AIMessage,
	HumanMessage,
	SystemMessage,
	ToolMessage,
} from "@langchain/core/messages";
import { Annotation } from "@langchain/langgraph";

export const StateAnnotation = Annotation.Root({
	messages: Annotation<
		(HumanMessage | ToolMessage | AIMessage | SystemMessage)[]
	>({
		reducer: (
			left: (HumanMessage | ToolMessage | AIMessage | SystemMessage)[],
			right:
				| HumanMessage
				| HumanMessage[]
				| ToolMessage
				| ToolMessage[]
				| AIMessage
				| AIMessage[]
				| SystemMessage
				| SystemMessage[],
		) => {
			if (Array.isArray(right)) {
				return left.concat(right);
			}
			return left.concat([right]);
		},
		default: () => [],
	}),
});
