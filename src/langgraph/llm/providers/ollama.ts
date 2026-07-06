import { ChatOllama } from "@langchain/ollama";
import type { LLMProviderFactory } from "@/langgraph/llm/types";

export const createOllamaModel: LLMProviderFactory = ({
	model,
	baseUrl,
	temperature,
}) =>
	new ChatOllama({
		model,
		temperature,
		baseUrl,
	});
