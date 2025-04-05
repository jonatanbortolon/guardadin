import { BaseModel } from "@/kysely/types/base";
import { Insertable, Selectable, Updateable } from "kysely";

export type ChatHistoryTable = {
	userId: number;
	role: string;
	text: Record<string, any>;
} & BaseModel;

export type ChatHistory = Selectable<ChatHistoryTable>;
export type NewChatHistory = Insertable<ChatHistoryTable>;
export type UpdateChatHistory = Updateable<ChatHistoryTable>;
