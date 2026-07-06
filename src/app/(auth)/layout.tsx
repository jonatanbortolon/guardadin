import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { type ReactNode, Suspense } from "react";
import { Layout } from "@/components/layout";
import { getSessionUser } from "@/libs/auth";
import { toPublicUser } from "@/libs/user";

export default async function AuthLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	const user = await getSessionUser();

	if (!user?.emailConfirmedAt) {
		redirect("/login");
	}

	// Seed the ["me"] query with the user we already loaded on the server, so the
	// client never has to round-trip to /api/auth/me (no loading flash).
	const queryClient = new QueryClient();
	queryClient.setQueryData(["me"], toPublicUser(user));

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<Layout>
				<Suspense>{children}</Suspense>
			</Layout>
		</HydrationBoundary>
	);
}
