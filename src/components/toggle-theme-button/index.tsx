"use client";
import { ComputerIcon, MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

export function ToggleThemeButton() {
	const { theme, setTheme, mounted } = useTheme();

	function onToggleThemeClick() {
		let newTheme = "system";

		if (theme === "system") {
			newTheme = "light";
		} else if (theme === "light") {
			newTheme = "dark";
		}

		setTheme(newTheme);
	}

	function renderIcon() {
		if (!mounted || theme === "system") {
			return <ComputerIcon />;
		}

		if (theme === "light") {
			return <SunIcon />;
		}

		return <MoonIcon />;
	}

	return (
		<Button size="icon" variant="outline" onClick={onToggleThemeClick}>
			{renderIcon()}
		</Button>
	);
}
