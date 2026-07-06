"use client";
import { LoaderCircleIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { type FormEvent, useEffect, useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useBootstrap, useLogin } from "@/hooks/use-auth";
import { ApiError } from "@/libs/fetcher";

type Step = "credentials" | "twoFactor";
type CodeMode = "totp" | "recovery";

export default function Page() {
	const t = useTranslations();
	const router = useRouter();
	const bootstrap = useBootstrap();
	const login = useLogin();
	const [form, setForm] = useState({
		email: "",
		password: "",
		rememberMe: false,
	});
	const [code, setCode] = useState("");
	const [step, setStep] = useState<Step>("credentials");
	const [codeMode, setCodeMode] = useState<CodeMode>("totp");

	useEffect(() => {
		if (bootstrap.data?.canBootstrap) {
			router.replace("/register");
		}
	}, [bootstrap.data, router]);

	const errors =
		login.error instanceof ApiError ? login.error.errors : undefined;
	const message =
		login.error instanceof ApiError && !login.error.errors
			? login.error.message
			: undefined;

	function submitCredentials(event: FormEvent) {
		event.preventDefault();
		login.mutate(form, {
			onSuccess: (data) => {
				if ("twoFactorRequired" in data) {
					setStep("twoFactor");
				} else {
					router.push("/dashboard");
				}
			},
		});
	}

	function submitCode(event: FormEvent) {
		event.preventDefault();
		login.mutate(
			{ ...form, code },
			{
				onSuccess: (data) => {
					if (!("twoFactorRequired" in data)) {
						router.push("/dashboard");
					}
				},
			},
		);
	}

	function switchMode(mode: CodeMode) {
		setCodeMode(mode);
		setCode("");
		login.reset();
	}

	function backToCredentials() {
		setStep("credentials");
		setCodeMode("totp");
		setCode("");
		login.reset();
	}

	if (step === "twoFactor") {
		return (
			<AuthShell
				title={
					codeMode === "totp"
						? t("auth.twoFactorTitle")
						: t("auth.recoveryTitle")
				}
				description={
					codeMode === "totp"
						? t("auth.twoFactorDescription")
						: t("auth.recoveryDescription")
				}
			>
				<form onSubmit={submitCode} className="flex flex-col gap-4">
					{codeMode === "totp" ? (
						<div className="grid gap-2">
							<Label>{t("auth.twoFactorCodeLabel")}</Label>
							<InputOTP
								maxLength={6}
								value={code}
								onChange={setCode}
								containerClassName="w-full"
								autoFocus
							>
								<InputOTPGroup className="w-full">
									<InputOTPSlot index={0} className="h-11 flex-1" />
									<InputOTPSlot index={1} className="h-11 flex-1" />
									<InputOTPSlot index={2} className="h-11 flex-1" />
									<InputOTPSlot index={3} className="h-11 flex-1" />
									<InputOTPSlot index={4} className="h-11 flex-1" />
									<InputOTPSlot index={5} className="h-11 flex-1" />
								</InputOTPGroup>
							</InputOTP>
							<p className="text-destructive text-sm">{errors?.code?.[0]}</p>
						</div>
					) : (
						<div className="grid gap-2">
							<Label>{t("auth.recoveryCodeLabel")}</Label>
							<Input
								value={code}
								autoComplete="one-time-code"
								onChange={(event) => setCode(event.target.value)}
							/>
							<p className="text-destructive text-sm">{errors?.code?.[0]}</p>
						</div>
					)}
					{message ? (
						<p className="text-destructive text-sm">{message}</p>
					) : null}
					<Button
						type="submit"
						disabled={
							login.isPending ||
							(codeMode === "totp" ? code.length < 6 : code.trim().length === 0)
						}
					>
						{login.isPending ? (
							<LoaderCircleIcon className="animate-spin" />
						) : null}
						{t("auth.verify")}
					</Button>
					<button
						type="button"
						className="text-muted-foreground text-sm hover:text-foreground"
						onClick={() =>
							switchMode(codeMode === "totp" ? "recovery" : "totp")
						}
					>
						{codeMode === "totp"
							? t("auth.useRecoveryCode")
							: t("auth.useAuthenticatorCode")}
					</button>
					<Button type="button" variant="ghost" onClick={backToCredentials}>
						{t("auth.backToLogin")}
					</Button>
				</form>
			</AuthShell>
		);
	}

	return (
		<AuthShell
			title={t("auth.loginTitle")}
			description={t("auth.loginDescription")}
		>
			<form onSubmit={submitCredentials} className="flex flex-col gap-4">
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
					<div className="flex items-center justify-between">
						<Label>{t("auth.password")}</Label>
						<Link
							href="/forgot-password"
							className="text-muted-foreground text-sm hover:text-foreground"
						>
							{t("auth.forgotPassword")}
						</Link>
					</div>
					<PasswordInput
						value={form.password}
						onChange={(event) =>
							setForm((old) => ({ ...old, password: event.target.value }))
						}
					/>
					<p className="text-destructive text-sm">{errors?.password?.[0]}</p>
				</div>
				<div className="-mt-2 mb-2 flex items-center gap-2">
					<Checkbox
						id="rememberMe"
						checked={form.rememberMe}
						onCheckedChange={(checked) =>
							setForm((old) => ({ ...old, rememberMe: checked === true }))
						}
					/>
					<Label htmlFor="rememberMe" className="cursor-pointer font-normal">
						{t("auth.rememberMe")}
					</Label>
				</div>
				{message ? <p className="text-destructive text-sm">{message}</p> : null}
				<Button type="submit" disabled={login.isPending}>
					{login.isPending ? (
						<LoaderCircleIcon className="animate-spin" />
					) : null}
					{t("auth.login")}
				</Button>
			</form>
		</AuthShell>
	);
}
