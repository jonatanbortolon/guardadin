import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	server: {
		SESSION_SECRET: z.string().min(1),
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
		DB_URL: z.string().url(),
		OPENAI_API_URL: z.string().url(),
		OPENAI_MODEL: z.string().min(1),
		OPENAI_API_KEY: z.string().min(1),
		WHATSAPP_TOKEN: z.string().min(1),
		WHATSAPP_PHONE_NUMBER_ID: z.string().min(1),
		WHATSAPP_WEBHOOK_TOKEN: z.string().min(1),
	},
	runtimeEnv: {
		SESSION_SECRET: process.env.SESSION_SECRET,
		NODE_ENV: process.env.NODE_ENV,
		DB_URL: process.env.DB_URL,
		OPENAI_API_URL: process.env.OPENAI_API_URL,
		OPENAI_MODEL: process.env.OPENAI_MODEL,
		OPENAI_API_KEY: process.env.OPENAI_API_KEY,
		WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN,
		WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
		WHATSAPP_WEBHOOK_TOKEN: process.env.WHATSAPP_WEBHOOK_TOKEN,
	},
});
