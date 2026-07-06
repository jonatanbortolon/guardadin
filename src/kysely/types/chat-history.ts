import type { Insertable, Selectable, Updateable } from "kysely";
import type { BaseModel } from "@/kysely/types/base";

export type ChatHistoryTable = {
	phoneNumber: string;
	role: string;
	text: Record<string, unknown>;
} & BaseModel;

export type ChatHistory = Selectable<ChatHistoryTable>;
export type NewChatHistory = Insertable<ChatHistoryTable>;
export type UpdateChatHistory = Updateable<ChatHistoryTable>;
