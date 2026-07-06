import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import type { LLMProviderFactory } from "@/langgraph/llm/types";

export const createGeminiModel: LLMProviderFactory = ({
	model,
	apiKey,
	baseUrl,
	temperature,
}) =>
	new ChatGoogleGenerativeAI({
		model,
		apiKey,
		temperature,
		...(baseUrl ? { baseUrl } : {}),
	});
