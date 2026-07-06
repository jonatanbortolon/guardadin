import { type BaseMessage, HumanMessage } from "@langchain/core/messages";
import { ResultAsync } from "neverthrow";
import { type NextRequest, NextResponse } from "next/server";
import type { PostData } from "whatsapp-api-js/types";
import { GENERIC_ERROR_MESSAGE } from "@/consts/whatsapp/messages/generic-error";
import { MESSAGE_TYPE_NOT_SUPPORTED } from "@/consts/whatsapp/messages/message-type-not-supported";
import { agent } from "@/langgraph";
import { loadHistory, saveMessage } from "@/langgraph/memory";
import { buildSystemMessages } from "@/langgraph/prompts/system";
import { env } from "@/libs/env";
import { kysely } from "@/libs/kysely";
import { whatsapp } from "@/libs/whatsapp";
import { normalizePhone } from "@/utils/phone";

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;

	const mode = searchParams.get("hub.mode");
	const challenge = searchParams.get("hub.challenge");
	const token = searchParams.get("hub.verify_token");

	if (mode !== "subscribe" || token !== env.WHATSAPP_WEBHOOK_TOKEN) {
		return NextResponse.json({ ok: false }, { status: 401 });
	}

	return new Response(challenge);
}

export async function POST(request: NextRequest) {
	const payload = (await request.json()) as PostData;

	const value = payload.entry?.[0]?.changes?.[0]?.value;
	const message =
		value && "messages" in value ? value.messages?.[0] : undefined;

	if (!message) {
		return NextResponse.json({ ok: true });
	}

	const phoneNumber = message.from;

	const allowedUser = await kysely
		.selectFrom("users")
		.select("id")
		.where("phone", "=", normalizePhone(phoneNumber))
		.where("botAllowed", "=", true)
		.executeTakeFirst();

	if (!allowedUser) {
		return NextResponse.json({ ok: true });
	}

	let userText: string | null = null;
	let image: { base64: string; mimeType: string } | null = null;

	if (message.type === "text") {
		userText = message.text.body;
	} else if (message.type === "image") {
		const mediaNT = await ResultAsync.fromPromise(
			whatsapp.downloadMedia(message.image.id),
			console.error,
		);

		if (mediaNT.isErr()) {
			await whatsapp.sendMessage(phoneNumber, GENERIC_ERROR_MESSAGE);
			return NextResponse.json({ ok: true });
		}

		image = mediaNT.value;
		userText = message.image.caption ?? null;
	} else {
		await whatsapp.sendMessage(phoneNumber, MESSAGE_TYPE_NOT_SUPPORTED);
		return NextResponse.json({ ok: true });
	}

	if (!userText && !image) {
		await whatsapp.sendMessage(phoneNumber, GENERIC_ERROR_MESSAGE);
		return NextResponse.json({ ok: true });
	}

	const [categories, bankAccounts, history] = await Promise.all([
		kysely.selectFrom("categories").selectAll().execute(),
		kysely.selectFrom("bank_accounts").selectAll().execute(),
		loadHistory(phoneNumber),
	]);

	const content = [
		...(userText ? [{ type: "text" as const, text: userText }] : []),
		...(image
			? [
					{
						type: "image" as const,
						mimeType: image.mimeType,
						data: image.base64,
					},
				]
			: []),
	];

	const messages: BaseMessage[] = [
		...buildSystemMessages(categories, bankAccounts),
		...history,
		new HumanMessage({ content }),
	];

	await saveMessage(phoneNumber, "user", userText ?? "[imagem]");

	await ResultAsync.fromPromise(
		agent.invoke({ messages }, { metadata: { phoneNumber } }),
		console.error,
	);

	return NextResponse.json({ ok: true });
}
