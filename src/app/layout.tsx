import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { PropsWithChildren, ReactNode } from "react";
import { I18nProvider } from "@/providers/i18n";
import { QueryProvider } from "@/providers/query";
import { ThemeProvider } from "@/providers/theme";
import { ToastProvider } from "@/providers/toast";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: {
		template: "GuardaDin - %s",
		default: "GuardaDin",
	},
	description:
		"Gerencie sua finança de uma forma facil e rapida através do Whatsapp",
};

function Providers({ children }: PropsWithChildren) {
	return (
		<I18nProvider>
			<ThemeProvider>
				<QueryProvider>
					<NuqsAdapter>
						<ToastProvider>{children}</ToastProvider>
					</NuqsAdapter>
				</QueryProvider>
			</ThemeProvider>
		</I18nProvider>
	);
}

export default function RootLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	return (
		<html
			className="dark"
			style={{ colorScheme: "dark" }}
			lang="pt-BR"
			suppressHydrationWarning
		>
			<head>
				<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
