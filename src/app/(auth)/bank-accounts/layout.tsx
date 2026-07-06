import type { Metadata } from "next";
import type { ReactNode } from "react";
import { messages } from "@/i18n/config";
import { getServerLocale } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
	const locale = await getServerLocale();

	return { title: messages[locale].bankAccounts.title };
}

export default function Layout({ children }: { children: ReactNode }) {
	return children;
}
