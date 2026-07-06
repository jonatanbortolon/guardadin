import { tool } from "@langchain/core/tools";
import { type SqlBool, sql } from "kysely";
import { z } from "zod";
import { kysely } from "@/libs/kysely";
import { formatDate } from "@/utils/format-date";
import { formatPrice } from "@/utils/format-price";

const MAX_RESULTS = 50;

const queryTransactionsSchema = z.object({
	description: z
		.string()
		.describe("Filter: description contains this text (case-insensitive).")
		.nullish(),
	descriptionRegex: z
		.string()
		.max(200)
		.describe(
			"Filter: POSIX regular expression matched against the description (case-insensitive).",
		)
		.nullish(),
	type: z
		.enum(["INCOME", "EXPENSE"])
		.describe("Filter by transaction type.")
		.nullish(),
	categoryId: z.number().int().describe("Filter by category id.").nullish(),
	bankAccountId: z
		.number()
		.int()
		.describe("Filter by bank account id.")
		.nullish(),
	totalParcels: z
		.number()
		.int()
		.describe("Filter by exact number of installments.")
		.nullish(),
	minTotal: z
		.number()
		.describe("Filter: minimum amount (inclusive).")
		.nullish(),
	maxTotal: z
		.number()
		.describe("Filter: maximum amount (inclusive).")
		.nullish(),
	startDate: z
		.string()
		.describe("Filter: only transactions on/after this ISO date.")
		.nullish(),
	endDate: z
		.string()
		.describe("Filter: only transactions on/before this ISO date.")
		.nullish(),
	limit: z
		.number()
		.int()
		.min(1)
		.max(MAX_RESULTS)
		.describe(`Max results to return (default 20, max ${MAX_RESULTS}).`)
		.nullish(),
});

export const queryTransactionsTool = tool(
	async (filters) => {
		const { limit: _limit, ...activeFilters } = filters;
		const hasFilter = Object.values(activeFilters).some(
			(value) => value !== null && value !== undefined,
		);

		if (!hasFilter) {
			return "Para buscar transações, preciso de pelo menos um filtro (nome, tipo, categoria, conta, parcelas, faixa de valor ou período).";
		}

		let query = kysely
			.selectFrom("transactions")
			.leftJoin("categories", "categories.id", "transactions.categoryId")
			.leftJoin(
				"bank_accounts",
				"bank_accounts.id",
				"transactions.bankAccountId",
			)
			.select([
				"transactions.id",
				"transactions.description",
				"transactions.total",
				"transactions.type",
				"transactions.boughtAt",
				"transactions.totalParcels",
				"categories.name as categoryName",
				"bank_accounts.name as bankAccountName",
			]);

		if (filters.description) {
			query = query.where(
				"transactions.description",
				"ilike",
				`%${filters.description}%`,
			);
		}
		if (filters.descriptionRegex) {
			query = query.where(
				sql<SqlBool>`${sql.ref("transactions.description")} ~* ${filters.descriptionRegex}`,
			);
		}
		if (filters.type) {
			query = query.where("transactions.type", "=", filters.type);
		}
		if (filters.categoryId != null) {
			query = query.where("transactions.categoryId", "=", filters.categoryId);
		}
		if (filters.bankAccountId != null) {
			query = query.where(
				"transactions.bankAccountId",
				"=",
				filters.bankAccountId,
			);
		}
		if (filters.totalParcels != null) {
			query = query.where(
				"transactions.totalParcels",
				"=",
				filters.totalParcels,
			);
		}
		if (filters.minTotal != null) {
			query = query.where("transactions.total", ">=", filters.minTotal);
		}
		if (filters.maxTotal != null) {
			query = query.where("transactions.total", "<=", filters.maxTotal);
		}
		if (filters.startDate) {
			query = query.where(
				"transactions.boughtAt",
				">=",
				new Date(filters.startDate),
			);
		}
		if (filters.endDate) {
			query = query.where(
				"transactions.boughtAt",
				"<=",
				new Date(filters.endDate),
			);
		}

		const limit = Math.min(filters.limit ?? 20, MAX_RESULTS);

		try {
			const rows = await query
				.orderBy("transactions.boughtAt", "desc")
				.limit(limit)
				.execute();

			if (!rows.length) {
				return "Nenhuma transação encontrada com esses filtros.";
			}

			const lines = rows.map((row) => {
				const sign = row.type === "EXPENSE" ? "🟥" : "🟩";
				return `- #${row.id} ${sign} ${row.description} | ${formatPrice(
					row.total,
				)} em ${row.totalParcels}x | ${formatDate(new Date(row.boughtAt))} | ${
					row.categoryName ? `categoria: ${row.categoryName}` : "sem categoria"
				} | ${
					row.bankAccountName ? `conta: ${row.bankAccountName}` : "sem conta"
				}`;
			});

			return `Encontrei ${rows.length} transação(ões):\n${lines.join("\n")}`;
		} catch (error) {
			console.error(error);
			return "Não consegui executar essa busca. Verifique se a expressão de busca é válida.";
		}
	},
	{
		name: "query_transactions",
		description:
			"Search and read the user's transactions. All filters are optional, but AT LEAST ONE must be provided: description text, description regex (POSIX, case-insensitive), type, category, bank account, installments, amount range and date range. Read-only.",
		schema: queryTransactionsSchema,
	},
);
