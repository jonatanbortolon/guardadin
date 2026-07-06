"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/libs/fetcher";
import type { PublicUser } from "@/libs/user";

export function useToggleBotAllowed() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, botAllowed }: { id: number; botAllowed: boolean }) =>
			apiFetch<PublicUser>(`/api/phones/${id}`, {
				method: "PATCH",
				body: JSON.stringify({ botAllowed }),
			}),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
	});
}
