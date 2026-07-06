import { tool } from "@langchain/core/tools";
import { monthRange, sumByType } from "@/langgraph/tools/reports/helpers";
import { formatPrice } from "@/utils/format-price";

export const lastMonthSummaryTool = tool(
	async () => {
		const range = monthRange(1);

		const spent = await sumByType("EXPENSE", range);
		const received = await sumByType("INCOME", range);

		return `📅💵 No mês passado você gastou *${formatPrice(spent)}* e recebeu *${formatPrice(
			received,
		)}*.`;
	},
	{
		name: "last_month_summary",
		description: "Get how much was spent and received in the previous month.",
	},
);
