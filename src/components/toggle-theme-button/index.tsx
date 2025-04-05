"use client";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { ComputerIcon, MoonIcon, SunIcon } from "lucide-react";

export function ToggleThemeButton() {
	const { theme, setTheme } = useTheme();

	function onToggleThemeClick() {
		let newTheme = "system";

		if (theme === "system") {
			newTheme = "light";
		} else if (theme === "light") {
			newTheme = "dark";
		}

		setTheme(newTheme);
	}

	return (
		<Button size="icon" variant="outline" onClick={onToggleThemeClick}>
			{theme === "system" ? (
				<ComputerIcon />
			) : theme === "light" ? (
				<SunIcon />
			) : (
				<MoonIcon />
			)}
		</Button>
	);
}
