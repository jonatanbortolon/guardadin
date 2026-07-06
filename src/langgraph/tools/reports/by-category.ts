import { tool } from "@langchain/core/tools";
import { monthRange, rankPrefix } from "@/langgraph/tools/reports/helpers";
import { kysely } from "@/libs/kysely";
import { formatPrice } from "@/utils/format-price";

export const spentByCategoryTool = tool(
	async () => {
		const { start, end } = monthRange();

		const rows = await kysely
			.selectFrom("categories")
			.innerJoin("transactions", "transactions.categoryId", "categories.id")
			.select("categories.name")
			.select(({ fn }) => [
				fn.sum<number | null>("transactions.total").as("total"),
			])
			.where("transactions.type", "=", "EXPENSE")
			.where((eb) => eb.between("transactions.boughtAt", start, end))
			.groupBy("categories.id")
			.orderBy("total", "desc")
			.execute();

		const withoutCategory = await kysely
			.selectFrom("transactions")
			.select(({ fn }) => [fn.sum<number | null>("total").as("total")])
			.where("type", "=", "EXPENSE")
			.where("categoryId", "is", null)
			.where((eb) => eb.between("boughtAt", start, end))
			.executeTakeFirst();

		const ranking = rows
			.map(
				(row, index) =>
					`${rankPrefix(index)} ${row.name}: *${formatPrice(row.total ?? 0)}*`,
			)
			.join("\n");

		return `🏷️ *Seus gastos por categoria neste mês*\n\n${ranking || "Nenhum gasto registrado."}\n\nSem categoria: *${formatPrice(
			withoutCategory?.total ?? 0,
		)}*`;
	},
	{
		name: "spent_by_category",
		description: "Get the current month's expenses grouped by category.",
	},
);
