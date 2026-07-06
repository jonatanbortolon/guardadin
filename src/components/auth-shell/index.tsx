import type { PropsWithChildren, ReactNode } from "react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ToggleThemeButton } from "@/components/toggle-theme-button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

type Props = PropsWithChildren<{
	title: ReactNode;
	description: ReactNode;
}>;

export function AuthShell({ title, description, children }: Props) {
	return (
		<div className="relative min-h-screen w-full flex flex-col items-center justify-center gap-6 p-4">
			<div className="absolute top-4 right-4 flex items-center gap-2">
				<LanguageSwitcher />
				<ToggleThemeButton />
			</div>
			<div className="flex items-center gap-2">
				<img src="/logo.svg" alt="GuardaDin" className="w-8 h-8" />
				<span className="text-xl font-bold text-primary">GuardaDin</span>
			</div>
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle>{title}</CardTitle>
					<CardDescription>{description}</CardDescription>
				</CardHeader>
				<CardContent>{children}</CardContent>
			</Card>
		</div>
	);
}
