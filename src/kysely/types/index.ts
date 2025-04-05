import { BankAccountTable } from "@/kysely/types/bank-account";
import { CategoryTable } from "@/kysely/types/category";
import { ChatHistoryTable } from "@/kysely/types/chat-history";
import { TransactionTable } from "@/kysely/types/transaction";
import { TransactionPaymentTable } from "@/kysely/types/transaction-payment";
import { UserTable } from "@/kysely/types/user";

export type Database = {
	users: UserTable;
	chat_histories: ChatHistoryTable;
	transactions: TransactionTable;
	transaction_payments: TransactionPaymentTable;
	categories: CategoryTable;
	bank_accounts: BankAccountTable;
};
