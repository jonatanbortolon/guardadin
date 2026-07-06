"use client";
import { useQuery } from "@tanstack/react-query";
import type { BankAccount } from "@/kysely/types/bank-account";
import type { Category } from "@/kysely/types/category";
import { apiFetch } from "@/libs/fetcher";

export type DashboardData = {
	thisMonthSpent: number;
	thisMonthReceived: number;
	thisMonthSpentCategories: (Category & { totalSpent: number | null })[];
	thisMonthSpentWithoutCategory: number | null;
	thisMonthSpentBankAccounts: (BankAccount & { totalSpent: number | null })[];
	thisMonthSpentWithoutBankAccount: number | null;
	lastMonthSpent: number;
	lastMonthReceived: number;
};

export function useDashboard() {
	return useQuery({
		queryKey: ["dashboard"],
		queryFn: () => apiFetch<DashboardData>("/api/dashboard"),
	});
}
