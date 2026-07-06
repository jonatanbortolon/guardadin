import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

export const LLM_PROVIDER_NAMES = [
	"ollama",
	"openai",
	"anthropic",
	"gemini",
] as const;

export type LLMProvider = (typeof LLM_PROVIDER_NAMES)[number];

export type LLMConfig = {
	model: string;
	apiKey?: string;
	baseUrl?: string;
	temperature: number;
};

export type ToolCallingChatModel = BaseChatModel &
	Required<Pick<BaseChatModel, "bindTools">>;

export type LLMProviderFactory = (config: LLMConfig) => ToolCallingChatModel;
