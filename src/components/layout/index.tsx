"use client";
import {
	BanknoteIcon,
	ChartLineIcon,
	LandmarkIcon,
	type LucideProps,
	ShieldIcon,
	TagIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import type { ForwardRefExoticComponent, PropsWithChildren } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserMenu } from "@/components/user-menu";
import { useMe } from "@/hooks/use-auth";

type Props = PropsWithChildren;

const NAV_SKELETON_KEYS = ["nav-1", "nav-2", "nav-3", "nav-4", "nav-5"];

type NavLinkProps = {
	text: string;
	url: string;
	icon: ForwardRefExoticComponent<
		Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
	>;
	selected?: boolean;
};

function NavLink({ text, url, icon: Icon, selected = false }: NavLinkProps) {
	return (
		<Button
			className="justify-start"
			variant={selected ? "default" : "ghost"}
			asChild
		>
			<Link href={url}>
				<Icon className="w-6 h-6" />
				<span className="text-sm font-medium">{text}</span>
			</Link>
		</Button>
	);
}

export function Layout({ children }: Props) {
	const t = useTranslations("nav");
	const pathname = usePathname();
	const me = useMe();

	const links: NavLinkProps[] = [
		{
			text: t("dashboard"),
			url: "/dashboard",
			icon: ChartLineIcon,
			selected: pathname === "/dashboard",
		},
		{
			text: t("transactions"),
			url: "/transactions",
			icon: BanknoteIcon,
			selected: pathname === "/transactions",
		},
		{
			text: t("categories"),
			url: "/categories",
			icon: TagIcon,
			selected: pathname === "/categories",
		},
		{
			text: t("bankAccounts"),
			url: "/bank-accounts",
			icon: LandmarkIcon,
			selected: pathname === "/bank-accounts",
		},
		...(me.data?.isAdmin
			? [
					{
						text: t("admin"),
						url: "/admin",
						icon: ShieldIcon,
						selected: pathname === "/admin",
					},
				]
			: []),
	];

	return (
		<div className="w-full h-full flex flex-col">
			<Header />
			<div className="w-full h-full flex items-start justify-start overflow-y-hidden">
				<aside className="h-full hidden w-3/5 lg:w-1/5 md:flex flex-col border-r border-border py-4">
					<div className="flex flex-col gap-2 px-2">
						{me.isPending
							? NAV_SKELETON_KEYS.map((key) => (
									<Skeleton key={key} className="h-9 w-full" />
								))
							: links.map((props) => (
									<NavLink key={`nav-link-${props.url}`} {...props} />
								))}
					</div>
					<UserMenu className="mt-auto" />
				</aside>
				<main className="w-full h-full flex flex-col overflow-y-auto">
					{children}
				</main>
			</div>
		</div>
	);
}
