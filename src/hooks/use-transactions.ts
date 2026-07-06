"use client";
import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import type { TransactionType } from "@/enums/transacation-type";
import type { Transaction } from "@/kysely/types/transaction";
import type { TransactionPayment } from "@/kysely/types/transaction-payment";
import { apiFetch, buildQuery } from "@/libs/fetcher";
import type { ListResult, SortDirection } from "@/types/api";

export type TransactionSort =
	| "total"
	| "totalParcels"
	| "boughtAt"
	| "createdAt"
	| "updatedAt"
	| "monthAmount"
	| "dueDate";

export type TransactionListParams = {
	page: number;
	perPage: number;
	from: string;
	to: string;
	description: string;
	categoryId: number[];
	bankAccountId: number[];
	sortBy: TransactionSort;
	sortDir: SortDirection;
};

export type TransactionWithParcels = Transaction & {
	monthAmount: number;
	monthParcelNumber: number;
	monthDueAt: string;
	payments: TransactionPayment[];
};

export type TransactionInput = {
	description: string;
	total: number;
	totalParcels: number;
	type: (typeof TransactionType)[keyof typeof TransactionType];
	boughtAt: string;
	categoryId: number | null;
	bankAccountId: number | null;
};

const KEY = "transactions";

export function useTransactions(params: TransactionListParams) {
	return useQuery({
		queryKey: [KEY, "list", params],
		queryFn: () =>
			apiFetch<ListResult<TransactionWithParcels>>(
				`/api/transactions${buildQuery(params)}`,
			),
		placeholderData: keepPreviousData,
	});
}

export function useCreateTransaction() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: TransactionInput) =>
			apiFetch<Transaction>("/api/transactions", {
				method: "POST",
				body: JSON.stringify(input),
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [KEY] });
			queryClient.invalidateQueries({ queryKey: ["dashboard"] });
		},
	});
}

export function useUpdateTransaction() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, ...input }: TransactionInput & { id: number }) =>
			apiFetch<Transaction>(`/api/transactions/${id}`, {
				method: "PATCH",
				body: JSON.stringify(input),
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [KEY] });
			queryClient.invalidateQueries({ queryKey: ["dashboard"] });
		},
	});
}

export function useDeleteTransaction() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) =>
			apiFetch<Transaction>(`/api/transactions/${id}`, { method: "DELETE" }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [KEY] });
			queryClient.invalidateQueries({ queryKey: ["dashboard"] });
		},
	});
}
