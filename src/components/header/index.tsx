"use client";
import Link from "next/link";
import { HamburgerMenu } from "@/components/hamburguer-menu";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ToggleThemeButton } from "@/components/toggle-theme-button";

export function Header() {
	return (
		<header className="w-full px-5 py-4 border-b border-border">
			<div className="w-full h-full flex justify-between items-center">
				<HamburgerMenu buttonClassName="mr-4" />
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
				<div className="flex items-center gap-2">
					<LanguageSwitcher />
					<ToggleThemeButton />
				</div>
			</div>
		</header>
	);
}
