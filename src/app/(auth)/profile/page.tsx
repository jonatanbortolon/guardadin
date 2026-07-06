"use client";
import {
	CheckIcon,
	CopyIcon,
	DownloadIcon,
	LoaderCircleIcon,
	ShieldCheckIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { QRCodeSVG } from "qrcode.react";
import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import { UserZonePageLayout } from "@/components/user-zone-page-layout";
import {
	type TwoFactorSetup,
	useDisableTwoFactor,
	useEnableTwoFactor,
	useMe,
	useSetupTwoFactor,
	useUpdateProfile,
} from "@/hooks/use-auth";
import { ApiError } from "@/libs/fetcher";
import { formatPhone } from "@/utils/format-phone";

type ProfileForm = {
	name: string;
	email: string;
	phone: string;
};

function ProfileInfoCard() {
	const t = useTranslations();
	const me = useMe();
	const update = useUpdateProfile();

	const [form, setForm] = useState<ProfileForm | null>(null);

	useEffect(() => {
		if (me.data && !form) {
			setForm({
				name: me.data.name,
				email: me.data.email,
				phone: me.data.phone ? `+${me.data.phone}` : "",
			});
		}
	}, [me.data, form]);

	const errors =
		update.error instanceof ApiError ? update.error.errors : undefined;
	const message =
		update.error instanceof ApiError && !update.error.errors
			? update.error.message
			: undefined;

	function submit(event: FormEvent) {
		event.preventDefault();

		if (!form) {
			return;
		}

		update.mutate(form, {
			onSuccess: () => toast.success(t("auth.profileUpdated")),
		});
	}

	return (
		<div className="flex w-full max-w-md flex-col gap-4 rounded-lg border bg-background p-6 shadow-lg">
			{form ? (
				<form onSubmit={submit} className="flex flex-col gap-4">
					<div className="grid gap-2">
						<Label>{t("auth.name")}</Label>
						<Input
							value={form.name}
							onChange={(event) =>
								setForm((old) =>
									old ? { ...old, name: event.target.value } : old,
								)
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
								setForm((old) =>
									old ? { ...old, email: event.target.value } : old,
								)
							}
						/>
						<p className="text-destructive text-sm">{errors?.email?.[0]}</p>
					</div>
					<div className="grid gap-2">
						<Label>{t("auth.phone")}</Label>
						<PhoneInput
							defaultCountry={formatPhone(form.phone).country ?? "BR"}
							value={form.phone}
							onChange={(value) =>
								setForm((old) => (old ? { ...old, phone: value ?? "" } : old))
							}
						/>
						<p className="text-destructive text-sm">{errors?.phone?.[0]}</p>
					</div>
					{message ? (
						<p className="text-destructive text-sm">{message}</p>
					) : null}
					<Button type="submit" disabled={update.isPending}>
						{update.isPending ? (
							<LoaderCircleIcon className="animate-spin" />
						) : null}
						{t("auth.save")}
					</Button>
				</form>
			) : (
				<div className="flex flex-col gap-4">
					<Skeleton className="h-9 w-full" />
					<Skeleton className="h-9 w-full" />
					<Skeleton className="h-9 w-full" />
					<Skeleton className="h-9 w-full" />
				</div>
			)}
		</div>
	);
}

function Step({
	step,
	title,
	children,
}: {
	step: number;
	title: string;
	children: ReactNode;
}) {
	return (
		<div className="flex gap-3">
			<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
				{step}
			</div>
			<div className="flex flex-1 flex-col gap-2">
				<p className="text-sm font-medium leading-6">{title}</p>
				{children}
			</div>
		</div>
	);
}

function TwoFactorEnrollment({
	setup,
	onDone,
}: {
	setup: TwoFactorSetup;
	onDone: () => void;
}) {
	const t = useTranslations();
	const enable = useEnableTwoFactor();
	const [code, setCode] = useState("");
	const [downloaded, setDownloaded] = useState(false);
	const [copied, setCopied] = useState(false);

	const errors =
		enable.error instanceof ApiError ? enable.error.errors : undefined;

	function copySecret() {
		navigator.clipboard?.writeText(setup.secret);
		setCopied(true);
		toast.success(t("twoFactor.copied"));
		window.setTimeout(() => setCopied(false), 2000);
	}

	function downloadCodes() {
		const blob = new Blob([setup.recoveryCodes.join("\n")], {
			type: "text/plain",
		});
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = t("twoFactor.recoveryFileName");
		anchor.click();
		URL.revokeObjectURL(url);
		setDownloaded(true);
	}

	function submit(event: FormEvent) {
		event.preventDefault();

		if (!downloaded) {
			return;
		}

		enable.mutate(
			{ code },
			{
				onSuccess: () => {
					toast.success(t("twoFactor.enabledToast"));
					onDone();
				},
			},
		);
	}

	return (
		<form onSubmit={submit} className="flex flex-col gap-4">
			<Step step={1} title={t("twoFactor.step1Title")}>
				<div className="flex justify-center py-1">
					<div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
						<QRCodeSVG value={setup.otpauthUrl} size={160} />
					</div>
				</div>
				<div className="flex h-10 items-center gap-1 rounded-md border bg-muted pr-1 pl-3">
					<code className="flex-1 truncate font-mono text-sm tracking-wider">
						{setup.secret}
					</code>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
						onClick={copySecret}
						aria-label={t("twoFactor.copySecret")}
					>
						{copied ? (
							<CheckIcon className="h-4 w-4 text-primary" />
						) : (
							<CopyIcon className="h-4 w-4" />
						)}
					</Button>
				</div>
				<p className="text-xs text-muted-foreground">
					{t("twoFactor.scanInstruction")}
				</p>
			</Step>

			<Step step={2} title={t("twoFactor.step2Title")}>
				<p className="text-xs text-muted-foreground">
					{t("twoFactor.recoveryInstruction")}
				</p>
				<div className="grid grid-cols-2 gap-1.5">
					{setup.recoveryCodes.map((recoveryCode) => (
						<code
							key={recoveryCode}
							className="rounded bg-muted px-2 py-1 text-center font-mono text-sm"
						>
							{recoveryCode}
						</code>
					))}
				</div>
				<Button
					type="button"
					variant="outline"
					className="w-full"
					onClick={downloadCodes}
				>
					<DownloadIcon className="h-4 w-4" />
					{downloaded
						? t("twoFactor.downloaded")
						: t("twoFactor.downloadCodes")}
				</Button>
				{!downloaded ? (
					<p className="text-xs text-muted-foreground">
						{t("twoFactor.mustDownload")}
					</p>
				) : null}
			</Step>

			<Step step={3} title={t("twoFactor.step3Title")}>
				<InputOTP
					maxLength={6}
					value={code}
					onChange={setCode}
					containerClassName="w-full"
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
			</Step>

			<div className="flex gap-2">
				<Button
					type="button"
					variant="ghost"
					className="flex-1"
					onClick={onDone}
				>
					{t("common.cancel")}
				</Button>
				<Button
					type="submit"
					className="flex-1"
					disabled={enable.isPending || !downloaded || code.length < 6}
				>
					{enable.isPending ? (
						<LoaderCircleIcon className="animate-spin" />
					) : null}
					{t("twoFactor.confirmEnable")}
				</Button>
			</div>
		</form>
	);
}

function TwoFactorDisable({ onDone }: { onDone: () => void }) {
	const t = useTranslations();
	const disable = useDisableTwoFactor();
	const [code, setCode] = useState("");

	const errors =
		disable.error instanceof ApiError ? disable.error.errors : undefined;

	function submit(event: FormEvent) {
		event.preventDefault();

		disable.mutate(
			{ code },
			{
				onSuccess: () => {
					toast.success(t("twoFactor.disabledToast"));
					onDone();
				},
			},
		);
	}

	return (
		<form onSubmit={submit} className="flex flex-col gap-4">
			<p className="text-sm text-muted-foreground">
				{t("twoFactor.disableInstruction")}
			</p>
			<div className="grid gap-2">
				<Label>{t("twoFactor.disableCodeLabel")}</Label>
				<Input
					value={code}
					autoComplete="one-time-code"
					onChange={(event) => setCode(event.target.value)}
				/>
				<p className="text-destructive text-sm">{errors?.code?.[0]}</p>
			</div>
			<div className="flex gap-2">
				<Button
					type="button"
					variant="ghost"
					className="flex-1"
					onClick={onDone}
				>
					{t("common.cancel")}
				</Button>
				<Button
					type="submit"
					variant="outline"
					className="flex-1 !border-destructive text-destructive hover:text-destructive"
					disabled={disable.isPending || code.length < 6}
				>
					{disable.isPending ? (
						<LoaderCircleIcon className="animate-spin" />
					) : null}
					{t("twoFactor.confirmDisable")}
				</Button>
			</div>
		</form>
	);
}

function TwoFactorCard() {
	const t = useTranslations();
	const me = useMe();
	const setup = useSetupTwoFactor();
	const [enrollment, setEnrollment] = useState<TwoFactorSetup | null>(null);
	const [disabling, setDisabling] = useState(false);

	const enabled = me.data?.twoFactorEnabled ?? false;

	function startSetup() {
		setup.mutate(undefined, {
			onSuccess: (data) => setEnrollment(data),
			onError: () => toast.error(t("common.serverError")),
		});
	}

	return (
		<div className="flex w-full max-w-md flex-col gap-4 rounded-lg border bg-background p-6 shadow-lg">
			<div className="flex flex-col gap-1">
				<div className="flex items-center justify-between gap-2">
					<h2 className="flex items-center gap-3 text-lg font-semibold">
						<span className="flex h-6 w-6 items-center justify-center">
							<ShieldCheckIcon className="h-5 w-5 text-primary" />
						</span>
						{t("twoFactor.title")}
					</h2>
					<span
						className={
							enabled
								? "rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
								: "rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
						}
					>
						{enabled
							? t("twoFactor.statusEnabled")
							: t("twoFactor.statusDisabled")}
					</span>
				</div>
				<p className="pl-9 text-muted-foreground text-sm">
					{enabled
						? t("twoFactor.enabledDescription")
						: t("twoFactor.disabledDescription")}
				</p>
			</div>

			{!me.data ? (
				<Skeleton className="h-9 w-full" />
			) : enabled ? (
				disabling ? (
					<TwoFactorDisable onDone={() => setDisabling(false)} />
				) : (
					<Button
						type="button"
						variant="outline"
						className="!border-destructive text-destructive hover:text-destructive"
						onClick={() => setDisabling(true)}
					>
						{t("twoFactor.disable")}
					</Button>
				)
			) : enrollment ? (
				<TwoFactorEnrollment
					setup={enrollment}
					onDone={() => setEnrollment(null)}
				/>
			) : (
				<Button type="button" onClick={startSetup} disabled={setup.isPending}>
					{setup.isPending ? (
						<LoaderCircleIcon className="animate-spin" />
					) : null}
					{t("twoFactor.enable")}
				</Button>
			)}
		</div>
	);
}

export default function Page() {
	const t = useTranslations();

	return (
		<UserZonePageLayout
			title={t("auth.profileTitle")}
			description={t("auth.profileDescription")}
		>
			<div className="flex w-full flex-col items-center gap-6">
				<ProfileInfoCard />
				<TwoFactorCard />
			</div>
		</UserZonePageLayout>
	);
}
