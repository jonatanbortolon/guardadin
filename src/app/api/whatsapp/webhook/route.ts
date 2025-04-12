import { GENERIC_ERROR_MESSAGE } from "@/consts/whatsapp/messages/generic-error";
import { MESSAGE_TYPE_NOT_SUPPORTED } from "@/consts/whatsapp/messages/message-type-not-supported";
import { env } from "@/libs/env";
import { kysely } from "@/libs/kysely";
import { langgraph } from "@/libs/langgraph";
import { whatsapp } from "@/libs/whatsapp";
import { whatsappWebhookPayload } from "@/types/whatsapp-webhook-payload";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ResultAsync } from "neverthrow";
import { NextRequest, NextResponse } from "next/server";

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

	const userPhoneNumber =
		payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from || null;

	if (!userPhoneNumber) {
		return NextResponse.json({ ok: true });
	}

	const messageType =
		payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.type || null;

	if (messageType !== "text") {
		await whatsapp.sendMessage(userPhoneNumber, MESSAGE_TYPE_NOT_SUPPORTED);
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
		await whatsapp.sendMessage(userPhoneNumber, GENERIC_ERROR_MESSAGE);
		return NextResponse.json({ ok: true });
	}

	const user = userNT.value;

	if (!user) {
		await whatsapp.sendMessage(userPhoneNumber, GENERIC_ERROR_MESSAGE);
		return NextResponse.json({ ok: true });
	}

	const message =
		payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body || null;

	if (!message) {
		await whatsapp.sendMessage(userPhoneNumber, GENERIC_ERROR_MESSAGE);
		return NextResponse.json({ ok: true });
	}

	const userId = user.id;

	const categories = await kysely
		.selectFrom("categories")
		.selectAll()
		.where("userId", "=", 1)
		.execute();

	const bankAccounts = await kysely
		.selectFrom("bank_accounts")
		.selectAll()
		.where("userId", "=", 1)
		.execute();

	const messages: (SystemMessage | HumanMessage)[] = [
		new SystemMessage(`You are an AI financial assistant designed to help users efficiently and securely manage their personal finances. You are a banking expert with extensive knowledge of the Brazilian banking system, including its various products, services, and cultural aspects such as parcelated payments, PIX, and other financial instruments. Your primary function is to assist users in tracking their income and expenses while providing insightful financial reports.

        *Important Instructions: *
        Transaction Management: Transactions must be categorized as either "income" or "expense" and assigned to standard categories such as Food, Personal Care, Housing, Donations, Education, Taxes, Leisure & Entertainment, Groceries, Pets, Health, Transportation, Utilities, Others, Travel, and Clothing.
        Transaction Validation: When recording past transactions, use the current date as a reference. If the transaction date is in the future, do not register it.
        Recurring Transactions: Register recurring transactions only once and use intelligent methods to determine the frequency (daily, weekly, monthly, or annually) and the number of repetitions.
        User Experience: Provide animated success messages after each transaction to enhance the user experience.
        Privacy and Security: Ensure data privacy by preventing any sharing of sensitive user information.
        Financial Insights: Be prepared to answer questions about financial reports within a specific date range and provide details on registered transactions.
        Additionally, you should avoid using slang terms or abbreviations in your explanations unless they are culturally ingrained in the Brazilian banking system (e.g., PIX). Use your expertise to make financial management easier and more accessible for users.

        You are not allowed to use any other tools than the ones listed below. If you don't know which tool to use, just awnser that you don't know how to do what user asks.`),
		new SystemMessage(
			`This is all user categories, if hasn't suitable category pass null: ${JSON.stringify(categories)}`,
		),
		new SystemMessage(
			`This is all user bank accounts, if not has default bank account and if not specified pass null: ${JSON.stringify(bankAccounts)}`,
		),
		new HumanMessage(message),
	];

	await ResultAsync.fromPromise(
		langgraph.agentBuilder.invoke(
			{ messages },
			{
				metadata: {
					userId,
					phoneNumber: userPhoneNumber,
				},
			},
		),
		console.error,
	);

	return NextResponse.json({ ok: true });
}
