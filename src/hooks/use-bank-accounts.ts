"use client";
import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import type { BankAccount } from "@/kysely/types/bank-account";
import { apiFetch, buildQuery } from "@/libs/fetcher";
import type { ListResult, SortDirection } from "@/types/api";

export type BankAccountSort = "createdAt" | "updatedAt" | "name";

export type BankAccountListParams = {
	page: number;
	perPage: number;
	q: string;
	sortBy: BankAccountSort;
	sortDir: SortDirection;
};

export type BankAccountInput = {
	name: string;
	isDefault: boolean;
};

const KEY = "bank-accounts";

export function useBankAccounts(params: BankAccountListParams) {
	return useQuery({
		queryKey: [KEY, "list", params],
		queryFn: () =>
			apiFetch<ListResult<BankAccount>>(
				`/api/bank-accounts${buildQuery(params)}`,
			),
		placeholderData: keepPreviousData,
	});
}

export function useAllBankAccounts() {
	return useQuery({
		queryKey: [KEY, "all"],
		queryFn: () =>
			apiFetch<ListResult<BankAccount>>(
				`/api/bank-accounts${buildQuery({ perPage: 50, sortBy: "name", sortDir: "asc" })}`,
			),
		select: (result) => result.data,
	});
}

export function useDefaultBankAccount() {
	return useQuery({
		queryKey: [KEY, "default"],
		queryFn: () => apiFetch<BankAccount | null>("/api/bank-accounts/default"),
	});
}

export function useCreateBankAccount() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: BankAccountInput) =>
			apiFetch<BankAccount>("/api/bank-accounts", {
				method: "POST",
				body: JSON.stringify(input),
			}),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
	});
}

export function useUpdateBankAccount() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, ...input }: BankAccountInput & { id: number }) =>
			apiFetch<BankAccount>(`/api/bank-accounts/${id}`, {
				method: "PATCH",
				body: JSON.stringify(input),
			}),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
	});
}

export function useDeleteBankAccount() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) =>
			apiFetch<BankAccount>(`/api/bank-accounts/${id}`, { method: "DELETE" }),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
	});
}
