import { ChatAnthropic } from "@langchain/anthropic";
import type { LLMProviderFactory } from "@/langgraph/llm/types";

export const createAnthropicModel: LLMProviderFactory = ({
	model,
	apiKey,
	baseUrl,
	temperature,
}) =>
	new ChatAnthropic({
		model,
		apiKey,
		temperature,
		...(baseUrl ? { anthropicApiUrl: baseUrl } : {}),
	});
