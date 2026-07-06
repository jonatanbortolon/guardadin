import { tool } from "@langchain/core/tools";

export const helpTool = tool(
	async () => {
		return `Posso te ajudar a cuidar das suas finanças por aqui! 💰

💸 Registrar uma saída: "gastei 50 reais no mercado hoje"
💰 Registrar uma entrada: "recebi 2000 de salário ontem"
🔎 Consultar lançamentos: "quanto gastei com comida esse mês?" ou "mostra minhas transações do Nubank"
📊 Relatórios: "gastos do mês", "gastos por categoria", "gastos por conta"
🗑️ Excluir um lançamento: "cancelar transação 12"

Pode me mandar por texto ou foto (ex: uma notinha) que eu registro pra você!`;
	},
	{
		name: "show_help",
		description:
			"Send the user a friendly list of the natural-language commands they can use. Call this whenever the user's message does not match any other tool, when they ask for help, or when they seem unsure about what they can do here.",
	},
);
