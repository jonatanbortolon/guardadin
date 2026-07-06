"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/libs/fetcher";
import type { PublicUser } from "@/libs/user";
import { useLocale } from "@/providers/i18n";

export function useMe() {
	return useQuery({
		queryKey: ["me"],
		queryFn: async () => {
			try {
				return await apiFetch<PublicUser>("/api/auth/me");
			} catch {
				return null;
			}
		},
		retry: false,
	});
}

export function useBootstrap() {
	return useQuery({
		queryKey: ["bootstrap"],
		queryFn: () => apiFetch<{ canBootstrap: boolean }>("/api/auth/register"),
	});
}

export function useInvite(token: string) {
	return useQuery({
		queryKey: ["invite", token],
		queryFn: () => apiFetch<{ email: string }>(`/api/auth/invite/${token}`),
		retry: false,
	});
}

export type LoginResult = PublicUser | { twoFactorRequired: true };

export function useLogin() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: {
			email: string;
			password: string;
			code?: string;
			rememberMe?: boolean;
		}) =>
			apiFetch<LoginResult>("/api/auth/login", {
				method: "POST",
				body: JSON.stringify(input),
			}),
		onSuccess: (data) => {
			if (!("twoFactorRequired" in data)) {
				queryClient.setQueryData(["me"], data);
			}
		},
	});
}

export function useLogout() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => apiFetch("/api/auth/logout", { method: "POST" }),
		onSuccess: () => {
			queryClient.setQueryData(["me"], null);
			queryClient.clear();
		},
	});
}

export function useRegister() {
	const { locale } = useLocale();

	return useMutation({
		mutationFn: (input: {
			name: string;
			email: string;
			phone: string;
			password: string;
			passwordConfirmation: string;
		}) =>
			apiFetch<PublicUser>("/api/auth/register", {
				method: "POST",
				body: JSON.stringify({ ...input, locale }),
			}),
	});
}

export function useRegisterInvited(token: string) {
	const { locale } = useLocale();

	return useMutation({
		mutationFn: (input: {
			name: string;
			phone: string;
			password: string;
			passwordConfirmation: string;
		}) =>
			apiFetch<PublicUser>(`/api/auth/register/${token}`, {
				method: "POST",
				body: JSON.stringify({ ...input, locale }),
			}),
	});
}

export function useConfirmEmail(token: string) {
	return useMutation({
		mutationFn: () =>
			apiFetch(`/api/auth/confirm/${token}`, { method: "POST" }),
	});
}

export function useForgotPassword() {
	const { locale } = useLocale();

	return useMutation({
		mutationFn: (input: { email: string }) =>
			apiFetch("/api/auth/forgot-password", {
				method: "POST",
				body: JSON.stringify({ ...input, locale }),
			}),
	});
}

export function useValidateResetToken(token: string) {
	return useQuery({
		queryKey: ["reset-token", token],
		queryFn: () =>
			apiFetch<{ valid: boolean }>(`/api/auth/reset-password/${token}`),
		retry: false,
	});
}

export function useResetPassword(token: string) {
	return useMutation({
		mutationFn: (input: { password: string; passwordConfirmation: string }) =>
			apiFetch(`/api/auth/reset-password/${token}`, {
				method: "POST",
				body: JSON.stringify(input),
			}),
	});
}

export function useUpdateProfile() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: { name: string; email: string; phone: string }) =>
			apiFetch<PublicUser>("/api/profile", {
				method: "PATCH",
				body: JSON.stringify(input),
			}),
		onSuccess: (user) => queryClient.setQueryData(["me"], user),
	});
}

export type TwoFactorSetup = {
	secret: string;
	otpauthUrl: string;
	recoveryCodes: string[];
};

export function useSetupTwoFactor() {
	return useMutation({
		mutationFn: () =>
			apiFetch<TwoFactorSetup>("/api/profile/2fa/setup", { method: "POST" }),
	});
}

export function useEnableTwoFactor() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: { code: string }) =>
			apiFetch<PublicUser>("/api/profile/2fa/enable", {
				method: "POST",
				body: JSON.stringify(input),
			}),
		onSuccess: (user) => queryClient.setQueryData(["me"], user),
	});
}

export function useDisableTwoFactor() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: { code: string }) =>
			apiFetch<PublicUser>("/api/profile/2fa/disable", {
				method: "POST",
				body: JSON.stringify(input),
			}),
		onSuccess: (user) => queryClient.setQueryData(["me"], user),
	});
}
