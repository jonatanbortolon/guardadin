"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ToggleThemeButton } from "@/components/toggle-theme-button";
import { Button } from "@/components/ui/button";

export function DefaultHeader() {
	const t = useTranslations("header");

	return (
		<header className="w-full px-5 py-4 border-b border-border">
			<div className="w-full h-full flex justify-between items-center">
				<Link className="flex items-center" href="/">
					<img
						src="/logo.svg"
						alt="GuardaDin"
						className="w-6 h-6 sm:w-8 sm:h-8"
					/>
					<span className="text-lg sm:text-xl font-bold ml-2 text-primary">
						GuardaDin
					</span>
				</Link>
				<div className="flex items-center gap-4">
					<Button asChild>
						<Link href="/dashboard">{t("openPlatform")}</Link>
					</Button>
					<LanguageSwitcher />
					<ToggleThemeButton />
				</div>
			</div>
		</header>
	);
}
