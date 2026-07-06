"use client";
import { CheckCircle2Icon, LoaderCircleIcon, XCircleIcon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { use, useEffect } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { useConfirmEmail } from "@/hooks/use-auth";

export default function Page({
	params,
}: {
	params: Promise<{ token: string }>;
}) {
	const { token } = use(params);
	const t = useTranslations();
	const confirm = useConfirmEmail(token);
	const { mutate } = confirm;

	useEffect(() => {
		mutate();
	}, [mutate]);

	return (
		<AuthShell title={t("auth.confirmTitle")} description="">
			<div className="flex flex-col items-center gap-4 py-2">
				{confirm.isPending || confirm.isIdle ? (
					<>
						<LoaderCircleIcon className="h-10 w-10 animate-spin text-muted-foreground" />
						<p className="text-sm text-muted-foreground">
							{t("auth.confirming")}
						</p>
					</>
				) : confirm.isSuccess ? (
					<>
						<CheckCircle2Icon className="h-10 w-10 text-primary" />
						<p className="text-sm text-center">{t("auth.confirmSuccess")}</p>
						<Button asChild className="w-full">
							<Link href="/login">{t("auth.goToLogin")}</Link>
						</Button>
					</>
				) : (
					<>
						<XCircleIcon className="h-10 w-10 text-destructive" />
						<p className="text-sm text-center">{t("auth.confirmError")}</p>
						<Button asChild variant="outline" className="w-full">
							<Link href="/login">{t("auth.goToLogin")}</Link>
						</Button>
					</>
				)}
			</div>
		</AuthShell>
	);
}
