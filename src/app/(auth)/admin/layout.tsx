import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { messages } from "@/i18n/config";
import { getServerLocale } from "@/i18n/server";
import { getSessionUser } from "@/libs/auth";

export async function generateMetadata(): Promise<Metadata> {
	const locale = await getServerLocale();

	return { title: messages[locale].admin.title };
}

export default async function Layout({ children }: { children: ReactNode }) {
	const user = await getSessionUser();

	if (!user?.isAdmin) {
		redirect("/dashboard");
	}

	return children;
}
