import { helpTool } from "@/langgraph/tools/help";
import { queryTransactionsTool } from "@/langgraph/tools/queries/query-transactions";
import { spentByBankAccountTool } from "@/langgraph/tools/reports/by-bank-account";
import { spentByCategoryTool } from "@/langgraph/tools/reports/by-category";
import { lastMonthSummaryTool } from "@/langgraph/tools/reports/last-month-summary";
import { monthSummaryTool } from "@/langgraph/tools/reports/month-summary";
import { createTransactionTool } from "@/langgraph/tools/transactions/create";
import { deleteTransactionTool } from "@/langgraph/tools/transactions/delete";

export const tools = [
	createTransactionTool,
	deleteTransactionTool,
	queryTransactionsTool,
	monthSummaryTool,
	lastMonthSummaryTool,
	spentByCategoryTool,
	spentByBankAccountTool,
	helpTool,
];
