import { tools } from "@/langgraph/tools";
import { env } from "@/libs/env";
import { ChatOpenAI } from "@langchain/openai";
import { ChatOllama } from "@langchain/ollama";

const llmWithoutTools =
    env.NODE_ENV === "development" ?
        new ChatOllama({
	        model: "llama3",
            temperature: 0,
            baseUrl: env.OLLAMA_API_URL,
        }) : new ChatOpenAI({
            configuration: {
                baseURL: env.OPENAI_API_URL,
            },
            apiKey: env.OPENAI_API_KEY,
            model: env.OPENAI_MODEL,
            temperature: 0,
        });

export const llm = llmWithoutTools.bindTools(tools);
