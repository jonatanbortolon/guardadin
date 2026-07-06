import { tool } from "@langchain/core/tools";
import { monthRange, rankPrefix } from "@/langgraph/tools/reports/helpers";
import { kysely } from "@/libs/kysely";
import { formatPrice } from "@/utils/format-price";

export const spentByBankAccountTool = tool(
	async () => {
		const { start, end } = monthRange();

		const rows = await kysely
			.selectFrom("bank_accounts")
			.innerJoin(
				"transactions",
				"transactions.bankAccountId",
				"bank_accounts.id",
			)
			.select("bank_accounts.name")
			.select(({ fn }) => [
				fn.sum<number | null>("transactions.total").as("total"),
			])
			.where("transactions.type", "=", "EXPENSE")
			.where((eb) => eb.between("transactions.boughtAt", start, end))
			.groupBy("bank_accounts.id")
			.orderBy("total", "desc")
			.execute();

		const withoutBankAccount = await kysely
			.selectFrom("transactions")
			.select(({ fn }) => [fn.sum<number | null>("total").as("total")])
			.where("type", "=", "EXPENSE")
			.where("bankAccountId", "is", null)
			.where((eb) => eb.between("boughtAt", start, end))
			.executeTakeFirst();

		const ranking = rows
			.map(
				(row, index) =>
					`${rankPrefix(index)} ${row.name}: *${formatPrice(row.total ?? 0)}*`,
			)
			.join("\n");

		return `🏦 *Seus gastos por conta bancária neste mês*\n\n${ranking || "Nenhum gasto registrado."}\n\nSem conta: *${formatPrice(
			withoutBankAccount?.total ?? 0,
		)}*`;
	},
	{
		name: "spent_by_bank_account",
		description: "Get the current month's expenses grouped by bank account.",
	},
);
