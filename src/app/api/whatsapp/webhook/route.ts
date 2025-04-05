import { env } from "@/libs/env";
import { kysely } from "@/libs/kysely";
import { openai } from "@/libs/openai";
import { whatsapp } from "@/libs/whatsapp";
import { whatsappWebhookPayload } from "@/types/whatsapp-webhook-payload";
import { buildToolsArgs } from "@/utils/build-tools-args";
import { getFunctionTools } from "@/utils/get-function-tools";
import { saveToolMessage } from "@/utils/save-tool-chat";
import { saveUserMessage } from "@/utils/save-user-chat";
import { ResultAsync } from "neverthrow";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;

	const mode = searchParams.get("hub.mode");
	const challenge = searchParams.get("hub.challenge");
	const token = searchParams.get("hub.verify_token");

	if (mode !== "subscribe" || token !== env.WHATSAPP_WEBHOOK_TOKEN) {
		return NextResponse.json(
			{ ok: false },
			{
				status: 401,
			},
		);
	}

	return new Response(challenge);
}

export async function POST(request: NextRequest) {
	const payload = (await request.json()) as whatsappWebhookPayload;

	const messageType =
		payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.type || null;

	if (messageType !== "text") {
		return NextResponse.json({ ok: true });
	}

	const userPhoneNumber =
		payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from || null;

	if (!userPhoneNumber) {
		return NextResponse.json({ ok: true });
	}

	const userNT = await ResultAsync.fromPromise(
		kysely
			.selectFrom("users")
			.selectAll()
			.where("phone", "=", userPhoneNumber)
			.executeTakeFirst(),
		() => ({
			message: "Tivemos um problema no servidor",
		}),
	);

	if (userNT.isErr()) {
		return NextResponse.json({ ok: true });
	}

	const user = userNT.value;

	if (!user) {
		return NextResponse.json({ ok: true });
	}

	const message =
		payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body || null;

	if (!message) {
		return NextResponse.json({ ok: true });
	}

	const userId = user.id;

	const responseNT = await ResultAsync.fromPromise(
		kysely.transaction().execute(async (trx) => {
			await saveUserMessage(userId, message);

			const categories = await trx
				.selectFrom("categories")
				.selectAll()
				.where("userId", "=", userId)
				.execute();

			const bankAccounts = await trx
				.selectFrom("bank_accounts")
				.selectAll()
				.where("userId", "=", userId)
				.execute();

			const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
				{
					role: "system",
					content: `You are an AI financial assistant designed to help users efficiently and securely manage their personal finances. You are a banking expert with extensive knowledge of the Brazilian banking system, including its various products, services, and cultural aspects such as parcelated payments, PIX, and other financial instruments. Your primary function is to assist users in tracking their income and expenses while providing insightful financial reports.

                *Important Instructions: *
                Transaction Management: Transactions must be categorized as either "income" or "expense" and assigned to standard categories such as Food, Personal Care, Housing, Donations, Education, Taxes, Leisure & Entertainment, Groceries, Pets, Health, Transportation, Utilities, Others, Travel, and Clothing.
                Transaction Validation: When recording past transactions, use the current date as a reference. If the transaction date is in the future, do not register it.
                Recurring Transactions: Register recurring transactions only once and use intelligent methods to determine the frequency (daily, weekly, monthly, or annually) and the number of repetitions.
                User Experience: Provide animated success messages after each transaction to enhance the user experience.
                Privacy and Security: Ensure data privacy by preventing any sharing of sensitive user information.
                Financial Insights: Be prepared to answer questions about financial reports within a specific date range and provide details on registered transactions.
                Additionally, you should avoid using slang terms or abbreviations in your explanations unless they are culturally ingrained in the Brazilian banking system (e.g., PIX). Use your expertise to make financial management easier and more accessible for users.

                You are not allowed to use any other tools than the ones listed below. If you don't know which tool to use, just awnser that you don't know how to do what user asks.`,
				},
				{
					role: "system",
					content: `This is all user categories, if hasn't suitable category pass null: ${JSON.stringify(categories)}`,
				},
				{
					role: "system",
					content: `This is all user bank accounts, if not has default bank account and if not specified pass null: ${JSON.stringify(bankAccounts)}`,
				},
				{ role: "user", content: message },
			];

			const completion = await openai.client.chat.completions.create({
				model: env.OPENAI_MODEL,
				messages,
				tools: openai.getOpenAITools(),
				store: true,
				tool_choice: "required",
				max_completion_tokens: 100,
			});

			const toolCalls = completion.choices[0].message.tool_calls || [];

			const functionTools = getFunctionTools();

			const toolCall = toolCalls[0];
			const toolExists = toolCall
				? !!functionTools[toolCall.function.name as keyof typeof functionTools]
				: false;

			if (!toolCall || !toolExists) {
				await whatsapp.sendErrorMessage(userId, userPhoneNumber);

				return;
			}

			await saveToolMessage(userId, toolCall.function);

			const toolCallArguments = JSON.parse(toolCall.function.arguments);

			await openai.callFunction(
				userId,
				userPhoneNumber,
				toolCall.function.name,
				buildToolsArgs(userId, toolCall.function.name, {
					...toolCallArguments,
				}),
			);
		}),
		(error) => {
			console.log(error);
			return {
				message: "Tivemos um problema no servidor",
			};
		},
	);

	if (responseNT.isErr()) {
		await ResultAsync.fromPromise(
			whatsapp.sendErrorMessage(user.id, userPhoneNumber),
			() => ({
				message: "Tivemos um problema no servidor",
			}),
		);
	}

	return NextResponse.json({ ok: true });
}
