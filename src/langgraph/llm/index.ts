import { llmProviders } from "@/langgraph/llm/providers";
import { tools } from "@/langgraph/tools";
import { env } from "@/libs/env";

const model = llmProviders[env.LLM_PROVIDER]({
	model: env.LLM_MODEL,
	apiKey: env.LLM_API_KEY,
	baseUrl: env.LLM_BASE_URL,
	temperature: env.LLM_TEMPERATURE,
});

export const llm = model.bindTools(tools);
