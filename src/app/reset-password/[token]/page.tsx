"use client";
import { LoaderCircleIcon, MailCheckIcon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { type FormEvent, use, useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useResetPassword, useValidateResetToken } from "@/hooks/use-auth";
import { ApiError } from "@/libs/fetcher";
import { isStrongPassword } from "@/utils/password-strength-calculator";

export default function Page({
	params,
}: {
	params: Promise<{ token: string }>;
}) {
	const { token } = use(params);
	const t = useTranslations();
	const validate = useValidateResetToken(token);
	const reset = useResetPassword(token);

	const [password, setPassword] = useState("");
	const [passwordConfirmation, setPasswordConfirmation] = useState("");

	const serverErrors =
		reset.error instanceof ApiError ? reset.error.errors : undefined;
	const serverMessage =
		reset.error instanceof ApiError && !reset.error.errors
			? reset.error.message
			: undefined;

	const strong = isStrongPassword(password);
	const matches = password === passwordConfirmation;
	const canSubmit = strong && matches && password.length > 0;

	function submit(event: FormEvent) {
		event.preventDefault();

		if (!canSubmit) {
			return;
		}

		reset.mutate({ password, passwordConfirmation });
	}

	if (reset.isSuccess) {
		return (
			<AuthShell
				title={t("auth.resetPassword")}
				description={t("auth.passwordResetSuccess")}
			>
				<div className="flex flex-col items-center gap-4 py-2">
					<MailCheckIcon className="h-10 w-10 text-primary" />
					<Button asChild className="w-full">
						<Link href="/login">{t("auth.goToLogin")}</Link>
					</Button>
				</div>
			</AuthShell>
		);
	}

	if (validate.isPending) {
		return (
			<AuthShell
				title={t("auth.resetPassword")}
				description={t("auth.forgotDescription")}
			>
				<div className="flex justify-center py-6">
					<LoaderCircleIcon className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			</AuthShell>
		);
	}

	if (validate.isError || !validate.data?.valid) {
		return (
			<AuthShell
				title={t("auth.resetInvalidTitle")}
				description={t("auth.resetInvalidDescription")}
			>
				<div className="flex flex-col gap-4 py-2">
					<Button asChild className="w-full">
						<Link href="/forgot-password">{t("auth.forgotPassword")}</Link>
					</Button>
					<Button asChild variant="ghost">
						<Link href="/login">{t("auth.backToLogin")}</Link>
					</Button>
				</div>
			</AuthShell>
		);
	}

	return (
		<AuthShell
			title={t("auth.resetPassword")}
			description={t("auth.resetDescription")}
		>
			<form onSubmit={submit} className="flex flex-col gap-4">
				<div className="grid gap-2">
					<Label>{t("auth.newPassword")}</Label>
					<PasswordInput
						showStrength
						value={password}
						onChange={(event) => setPassword(event.target.value)}
					/>
					<p className="text-destructive text-sm">
						{serverErrors?.password?.[0]}
					</p>
				</div>
				<div className="grid gap-2">
					<Label>{t("auth.confirmPassword")}</Label>
					<PasswordInput
						value={passwordConfirmation}
						onChange={(event) => setPasswordConfirmation(event.target.value)}
					/>
					<p className="text-destructive text-sm">
						{passwordConfirmation.length > 0 && !matches
							? t("auth.passwordsDontMatch")
							: serverErrors?.passwordConfirmation?.[0]}
					</p>
				</div>
				{serverMessage ? (
					<p className="text-destructive text-sm">{serverMessage}</p>
				) : null}
				<Button type="submit" disabled={reset.isPending || !canSubmit}>
					{reset.isPending ? (
						<LoaderCircleIcon className="animate-spin" />
					) : null}
					{t("auth.resetPassword")}
				</Button>
				<Button asChild variant="ghost">
					<Link href="/login">{t("auth.backToLogin")}</Link>
				</Button>
			</form>
		</AuthShell>
	);
}
