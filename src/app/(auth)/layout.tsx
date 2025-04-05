import { UserZoneLayout } from "@/components/user-zone-layout";
import { ReactNode } from "react";

export default async function Layout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	return <UserZoneLayout>{children}</UserZoneLayout>;
}
