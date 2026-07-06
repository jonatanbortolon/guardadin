"use client";
import { LoaderCircleIcon, MailCheckIcon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPassword } from "@/hooks/use-auth";
import { ApiError } from "@/libs/fetcher";

export default function Page() {
	const t = useTranslations();
	const forgot = useForgotPassword();
	const [email, setEmail] = useState("");

	const forgotErrors =
		forgot.error instanceof ApiError ? forgot.error.errors : undefined;

	function requestLink(event: FormEvent) {
		event.preventDefault();
		forgot.mutate({ email });
	}

	if (forgot.isSuccess) {
		return (
			<AuthShell
				title={t("auth.resetLinkSentTitle")}
				description={t("auth.resetLinkSentDescription")}
			>
				<div className="flex flex-col items-center gap-4 py-2">
					<MailCheckIcon className="h-10 w-10 text-primary" />
					<Button asChild className="w-full">
						<Link href="/login">{t("auth.backToLogin")}</Link>
					</Button>
				</div>
			</AuthShell>
		);
	}

	return (
		<AuthShell
			title={t("auth.forgotTitle")}
			description={t("auth.forgotDescription")}
		>
			<form onSubmit={requestLink} className="flex flex-col gap-4">
				<div className="grid gap-2">
					<Label>{t("auth.email")}</Label>
					<Input
						type="email"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
					/>
					<p className="text-destructive text-sm">{forgotErrors?.email?.[0]}</p>
				</div>
				<Button type="submit" disabled={forgot.isPending}>
					{forgot.isPending ? (
						<LoaderCircleIcon className="animate-spin" />
					) : null}
					{t("auth.sendResetLink")}
				</Button>
				<Button asChild variant="ghost">
					<Link href="/login">{t("auth.backToLogin")}</Link>
				</Button>
			</form>
		</AuthShell>
	);
}
