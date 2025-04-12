import { tools } from "@/langgraph/tools";
import { env } from "@/libs/env";
import { ChatOpenAI } from "@langchain/openai";

const llmWithoutTools = new ChatOpenAI({
	configuration: {
		baseURL: env.OPENAI_API_URL,
	},
	apiKey: env.OPENAI_API_KEY,
	model: env.OPENAI_MODEL,
	temperature: 0,
});

export const llm = llmWithoutTools.bindTools(tools);
