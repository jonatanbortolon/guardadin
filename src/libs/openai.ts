import { Database } from "@/kysely/types";
import { env } from "@/libs/env";
import { getFunctionTools } from "@/utils/get-function-tools";
import { Transaction } from "kysely";
import OpenAI from "openai";

const openaiClient = new OpenAI({
	apiKey: env.OPENAI_API_KEY,
	baseURL: env.OPENAI_API_URL,
});

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
	{
		type: "function",
		function: {
			name: "create_transaction",
			description:
				"Create transacation for the user. The user will be prompted to enter the amount and the description of the transaction.",
			parameters: {
				type: "object",
				properties: {
					description: {
						type: "string",
						desciption:
							"Transaction description that can contains the product or service that the user provides. Only substantive information and adjectives are allowed. Verbs and adverbs are not allowed. Substantivated verbs are not allowed.",
					},
					total: {
						type: "number",
						desciption:
							"Total amount of the transaction. Cannot be negative or equal to 0.",
					},
					totalParcels: {
						type: "number",
						desciption:
							"Total parcels of the transaction, one parcel is equivalent to one month. Minimum is 1.",
					},
					type: {
						type: "string",
						desciption:
							"Type of the transaction. Can be INCOME for money income or EXPENSE for money expense.",
						enum: ["INCOME", "EXPENSE"],
					},
					boughtAt: {
						type: "string",
						desciption:
							"Date when the transaction was bought. Must be in ISO format. Example: 2023-03-01T00:00:00.000Z. If hasn't specified, the today's date will be used. Future dates are allowed.",
					},
					categoryId: {
						type: "number",
						desciption:
							"Category id of the transaction. Must be a number. If hasn't suitable category pass null",
					},
					bankAccountId: {
						type: "number",
						desciption:
							"Bank account id of the transaction. Must be a number. If user doesn't specify, the default bank account will be used, if user doesn't have a default bank account, pass null.",
					},
				},
				required: ["description", "total", "totalParcels", "type"],
				additionalProperties: false,
			},
		},
	},
	{
		type: "function",
		function: {
			name: "delete_transaction",
			description:
				"Delete transaction for the user. The user will be prompted to enter the id of the transaction to delete.",
			parameters: {
				type: "object",
				properties: {
					id: {
						type: "number",
						desciption: "Id of the transaction to delete. Must be a number.",
					},
				},
				required: ["id"],
				additionalProperties: false,
			},
			strict: true,
		},
	},
];

export const openai = {
	client: openaiClient,
	getOpenAITools() {
		return tools;
	},
	async callFunction(
		userId: number,
		phoneNumber: string,
		toolName: string,
		args: any,
		opts?: {
			trx: Transaction<Database>;
		},
	) {
		const tools = getFunctionTools();
		const tool = tools[toolName as keyof typeof tools];

		if (!tool) {
			throw new Error(`Tool ${toolName} not found`);
		}

		return await tool(
			userId,
			phoneNumber,
			typeof args === "string" ? JSON.parse(args) : args,
			opts,
		);
	},
};
