import { createTransactionTool } from "@/langgraph/tools/create-transaction";
import { deleteTransactionTool } from "@/langgraph/tools/delete-transaction";
import { monthSpentTool } from "./month-spent";

export const tools = [
	createTransactionTool,
	deleteTransactionTool,
	monthSpentTool,
];
