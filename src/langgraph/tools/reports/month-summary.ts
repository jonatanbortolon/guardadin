import { tool } from "@langchain/core/tools";
import { intervalToDuration } from "date-fns";
import { monthRange, sumByType } from "@/langgraph/tools/reports/helpers";
import { formatPrice } from "@/utils/format-price";

export const monthSummaryTool = tool(
	async () => {
		const range = monthRange();

		const spent = await sumByType("EXPENSE", range);
		const received = await sumByType("INCOME", range);

		const daysLeft =
			intervalToDuration({ start: new Date(), end: range.end }).days ?? 0;

		return `📅💵 Neste mês você gastou *${formatPrice(spent)}* e recebeu *${formatPrice(
			received,
		)}*.\n\n⚠️ Faltam ${daysLeft} dias para o fim do mês — organize-se para sobrar uma graninha!`;
	},
	{
		name: "month_summary",
		description: "Get how much was spent and received in the current month.",
	},
);
