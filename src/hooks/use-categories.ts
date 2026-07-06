"use client";
import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import type { Category } from "@/kysely/types/category";
import { apiFetch, buildQuery } from "@/libs/fetcher";
import type { ListResult, SortDirection } from "@/types/api";

export type CategorySort = "createdAt" | "updatedAt" | "name";

export type CategoryListParams = {
	page: number;
	perPage: number;
	q: string;
	sortBy: CategorySort;
	sortDir: SortDirection;
};

export type CategoryInput = {
	name: string;
	isDefault: boolean;
};

const KEY = "categories";

export function useCategories(params: CategoryListParams) {
	return useQuery({
		queryKey: [KEY, "list", params],
		queryFn: () =>
			apiFetch<ListResult<Category>>(`/api/categories${buildQuery(params)}`),
		placeholderData: keepPreviousData,
	});
}

export function useAllCategories() {
	return useQuery({
		queryKey: [KEY, "all"],
		queryFn: () =>
			apiFetch<ListResult<Category>>(
				`/api/categories${buildQuery({ perPage: 50, sortBy: "name", sortDir: "asc" })}`,
			),
		select: (result) => result.data,
	});
}

export function useDefaultCategory() {
	return useQuery({
		queryKey: [KEY, "default"],
		queryFn: () => apiFetch<Category | null>("/api/categories/default"),
	});
}

export function useCreateCategory() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CategoryInput) =>
			apiFetch<Category>("/api/categories", {
				method: "POST",
				body: JSON.stringify(input),
			}),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
	});
}

export function useUpdateCategory() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, ...input }: CategoryInput & { id: number }) =>
			apiFetch<Category>(`/api/categories/${id}`, {
				method: "PATCH",
				body: JSON.stringify(input),
			}),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
	});
}

export function useDeleteCategory() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) =>
			apiFetch<Category>(`/api/categories/${id}`, { method: "DELETE" }),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
	});
}
