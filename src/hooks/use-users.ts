"use client";
import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import type { UserPermissionType } from "@/enums/user-permission";
import { apiFetch, buildQuery } from "@/libs/fetcher";
import type { PublicUser } from "@/libs/user";
import { useLocale } from "@/providers/i18n";
import type { ListResult, SortDirection } from "@/types/api";

export type UserSort = "createdAt" | "updatedAt" | "email" | "name";

export type UserListParams = {
	page: number;
	perPage: number;
	q: string;
	sortBy: UserSort;
	sortDir: SortDirection;
};

export type Invite = {
	id: number;
	token: string;
	email: string;
	permission: UserPermissionType;
	registerUrl: string;
};

const KEY = "users";

export function useUsers(params: UserListParams) {
	return useQuery({
		queryKey: [KEY, "list", params],
		queryFn: () =>
			apiFetch<ListResult<PublicUser>>(`/api/users${buildQuery(params)}`),
		placeholderData: keepPreviousData,
	});
}

export function useCreateInvite() {
	const queryClient = useQueryClient();
	const { locale } = useLocale();

	return useMutation({
		mutationFn: (input: { email: string; permission: UserPermissionType }) =>
			apiFetch<Invite>("/api/invites", {
				method: "POST",
				body: JSON.stringify({ ...input, locale }),
			}),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invites"] }),
	});
}

export function useUpdateUserPermission() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			permission,
		}: {
			id: number;
			permission: UserPermissionType;
		}) =>
			apiFetch<PublicUser>(`/api/users/${id}`, {
				method: "PATCH",
				body: JSON.stringify({ permission }),
			}),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
	});
}

export function useDeleteUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) =>
			apiFetch<PublicUser>(`/api/users/${id}`, { method: "DELETE" }),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
	});
}
