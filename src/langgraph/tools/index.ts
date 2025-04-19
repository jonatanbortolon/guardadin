import { createTransactionTool } from "@/langgraph/tools/create-transaction";
import { deleteTransactionTool } from "@/langgraph/tools/delete-transaction";
import { monthSpentAndReceivedTool } from "@/langgraph/tools/month-spent-and-received";
import { monthSpentByBankAccountTool } from "./month-spent-by-bank-account";
import { monthSpentByCategoryTool } from "./month-spent-by-category";
import { lastMonthSpentAndReceivedTool } from "./last-month-spent-and-received";

export const tools = [
	createTransactionTool,
	deleteTransactionTool,
	monthSpentAndReceivedTool,
	lastMonthSpentAndReceivedTool,
	monthSpentByCategoryTool,
	monthSpentByBankAccountTool,
];
