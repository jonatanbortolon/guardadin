import { ThemeProvider as NextThemeProvider } from "next-themes";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren;

export function ThemeProvider({ children }: Props) {
	return (
		<NextThemeProvider attribute="class" defaultTheme="system" enableSystem>
			{children}
		</NextThemeProvider>
	);
}
