import { ChatOpenAI } from "@langchain/openai";
import type { LLMProviderFactory } from "@/langgraph/llm/types";

export const createOpenAIModel: LLMProviderFactory = ({
	model,
	apiKey,
	baseUrl,
	temperature,
}) =>
	new ChatOpenAI({
		model,
		apiKey,
		temperature,
		...(baseUrl ? { configuration: { baseURL: baseUrl } } : {}),
	});
