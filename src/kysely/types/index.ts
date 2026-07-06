import type { BankAccountTable } from "@/kysely/types/bank-account";
import type { CategoryTable } from "@/kysely/types/category";
import type { ChatHistoryTable } from "@/kysely/types/chat-history";
import type { InviteTable } from "@/kysely/types/invite";
import type { SessionTable } from "@/kysely/types/session";
import type { TransactionTable } from "@/kysely/types/transaction";
import type { TransactionPaymentTable } from "@/kysely/types/transaction-payment";
import type { UserTable } from "@/kysely/types/user";

export type Database = {
	chat_histories: ChatHistoryTable;
	transactions: TransactionTable;
	transaction_payments: TransactionPaymentTable;
	categories: CategoryTable;
	bank_accounts: BankAccountTable;
	users: UserTable;
	invites: InviteTable;
	sessions: SessionTable;
};
