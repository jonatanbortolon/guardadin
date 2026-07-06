"use client";
import { useTheme as useNextTheme } from "next-themes";
import { useEffect, useState } from "react";

export function useTheme() {
	const { theme, setTheme } = useNextTheme();

	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	return {
		theme,
		setTheme,
		mounted,
	};
}
