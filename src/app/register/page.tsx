"use client";
import { LoaderCircleIcon, MailCheckIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { type FormEvent, useEffect, useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { useBootstrap, useRegister } from "@/hooks/use-auth";
import { ApiError } from "@/libs/fetcher";
import { isStrongPassword } from "@/utils/password-strength-calculator";

export default function Page() {
	const t = useTranslations();
	const router = useRouter();
	const bootstrap = useBootstrap();
	const register = useRegister();
	const [form, setForm] = useState({
		name: "",
		email: "",
		phone: "",
		password: "",
		passwordConfirmation: "",
	});

	useEffect(() => {
		if (bootstrap.data && !bootstrap.data.canBootstrap) {
			router.replace("/login");
		}
	}, [bootstrap.data, router]);

	const errors =
		register.error instanceof ApiError ? register.error.errors : undefined;
	const message =
		register.error instanceof ApiError && !register.error.errors
			? register.error.message
			: undefined;

	const strong = isStrongPassword(form.password);
	const matches = form.password === form.passwordConfirmation;
	const canSubmit = strong && matches && form.password.length > 0;

	function submit(event: FormEvent) {
		event.preventDefault();

		if (!canSubmit) {
			return;
		}

		register.mutate(form);
	}

	if (register.isSuccess) {
		return (
			<AuthShell
				title={t("auth.registerTitle")}
				description={t("auth.checkYourEmail")}
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

	if (!bootstrap.data?.canBootstrap) {
		return null;
	}

	return (
		<AuthShell
			title={t("auth.registerTitle")}
			description={t("auth.registerDescription")}
		>
			<form onSubmit={submit} className="flex flex-col gap-4">
				<div className="grid gap-2">
					<Label>{t("auth.name")}</Label>
					<Input
						value={form.name}
						onChange={(event) =>
							setForm((old) => ({ ...old, name: event.target.value }))
						}
					/>
					<p className="text-destructive text-sm">{errors?.name?.[0]}</p>
				</div>
				<div className="grid gap-2">
					<Label>{t("auth.email")}</Label>
					<Input
						type="email"
						value={form.email}
						onChange={(event) =>
							setForm((old) => ({ ...old, email: event.target.value }))
						}
					/>
					<p className="text-destructive text-sm">{errors?.email?.[0]}</p>
				</div>
				<div className="grid gap-2">
					<Label>{t("auth.phone")}</Label>
					<PhoneInput
						defaultCountry="BR"
						value={form.phone}
						onChange={(value) =>
							setForm((old) => ({ ...old, phone: value ?? "" }))
						}
					/>
					<p className="text-destructive text-sm">{errors?.phone?.[0]}</p>
				</div>
				<div className="grid gap-2">
					<Label>{t("auth.password")}</Label>
					<PasswordInput
						showStrength
						value={form.password}
						onChange={(event) =>
							setForm((old) => ({ ...old, password: event.target.value }))
						}
					/>
					<p className="text-destructive text-sm">{errors?.password?.[0]}</p>
				</div>
				<div className="grid gap-2">
					<Label>{t("auth.confirmPassword")}</Label>
					<PasswordInput
						value={form.passwordConfirmation}
						onChange={(event) =>
							setForm((old) => ({
								...old,
								passwordConfirmation: event.target.value,
							}))
						}
					/>
					<p className="text-destructive text-sm">
						{form.passwordConfirmation.length > 0 && !matches
							? t("auth.passwordsDontMatch")
							: errors?.passwordConfirmation?.[0]}
					</p>
				</div>
				{message ? <p className="text-destructive text-sm">{message}</p> : null}
				<Button type="submit" disabled={register.isPending || !canSubmit}>
					{register.isPending ? (
						<LoaderCircleIcon className="animate-spin" />
					) : null}
					{t("auth.register")}
				</Button>
			</form>
		</AuthShell>
	);
}
