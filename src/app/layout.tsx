import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "@/providers/theme";
import { ToastProvider } from "@/providers/toast";
import { PropsWithChildren, ReactNode } from "react";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "GuardaDin",
	description:
		"Gerencie sua finança de uma forma facil e rapida através do Whatsapp",
};

function Providers({ children }: PropsWithChildren) {
	return (
		<>
			<ThemeProvider>
				<ToastProvider>{children}</ToastProvider>
			</ThemeProvider>
		</>
	);
}

export default function RootLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	return (
		<html className="dark" style={{ colorScheme: "dark" }} lang="pt-BR">
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
