import { DefaultHeader } from "@/components/default-header";
import { ReactNode } from "react";

export default async function Layout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	return (
		<>
			<DefaultHeader />
			{children}
		</>
	);
}
