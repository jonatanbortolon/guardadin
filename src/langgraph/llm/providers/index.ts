import { createAnthropicModel } from "@/langgraph/llm/providers/anthropic";
import { createGeminiModel } from "@/langgraph/llm/providers/gemini";
import { createOllamaModel } from "@/langgraph/llm/providers/ollama";
import { createOpenAIModel } from "@/langgraph/llm/providers/openai";
import type { LLMProvider, LLMProviderFactory } from "@/langgraph/llm/types";

export const llmProviders: Record<LLMProvider, LLMProviderFactory> = {
	ollama: createOllamaModel,
	openai: createOpenAIModel,
	anthropic: createAnthropicModel,
	gemini: createGeminiModel,
};
