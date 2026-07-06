import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
import { LLM_PROVIDER_NAMES } from "@/langgraph/llm/types";

export const env = createEnv({
	server: {
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
		DB_URL: z.url(),
		TRANSACTIONS_URL: z.url(),
		LLM_PROVIDER: z.enum(LLM_PROVIDER_NAMES).default("ollama"),
		LLM_MODEL: z.string().min(1),
		LLM_API_KEY: z.string().optional(),
		LLM_BASE_URL: z.url().optional(),
		LLM_TEMPERATURE: z.coerce.number().min(0).max(2).default(0),
		WHATSAPP_TOKEN: z.string().min(1),
		WHATSAPP_PHONE_NUMBER_ID: z.string().min(1),
		WHATSAPP_WEBHOOK_TOKEN: z.string().min(1),
		APP_URL: z.url().default("http://localhost:3000"),
		EMAIL_HOST: z.string().default("localhost"),
		EMAIL_PORT: z.coerce.number().default(1025),
		EMAIL_SECURE: z
			.string()
			.default("false")
			.transform((value) => value === "true" || value === "1"),
		EMAIL_USER: z.string().optional(),
		EMAIL_PASSWORD: z.string().optional(),
	},
	runtimeEnv: {
		NODE_ENV: process.env.NODE_ENV,
		DB_URL: process.env.DB_URL,
		TRANSACTIONS_URL: process.env.TRANSACTIONS_URL,
		LLM_PROVIDER: process.env.LLM_PROVIDER,
		LLM_MODEL: process.env.LLM_MODEL,
		LLM_API_KEY: process.env.LLM_API_KEY,
		LLM_BASE_URL: process.env.LLM_BASE_URL,
		LLM_TEMPERATURE: process.env.LLM_TEMPERATURE,
		WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN,
		WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
		WHATSAPP_WEBHOOK_TOKEN: process.env.WHATSAPP_WEBHOOK_TOKEN,
		APP_URL: process.env.APP_URL,
		EMAIL_HOST: process.env.EMAIL_HOST,
		EMAIL_PORT: process.env.EMAIL_PORT,
		EMAIL_SECURE: process.env.EMAIL_SECURE,
		EMAIL_USER: process.env.EMAIL_USER,
		EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
	},
});
