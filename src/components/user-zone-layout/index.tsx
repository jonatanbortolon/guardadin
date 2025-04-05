"use client";
import { Button, Props as ButtonProps } from "@/components/ui/button";
import { UserHeader } from "@/components/user-header";
import {
	BanknoteIcon,
	LandmarkIcon,
	type LucideProps,
	TagIcon,
	UserIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ForwardRefExoticComponent, type PropsWithChildren } from "react";

type Props = PropsWithChildren;

type UserZoneNavLinkProps = {
	text: string;
	url: string;
	icon: ForwardRefExoticComponent<
		Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
	>;
	selected?: boolean;
};

function UserZoneNavLink({
	text,
	url,
	icon: Icon,
	selected = false,
}: UserZoneNavLinkProps) {
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

export function UserZoneLayout({ children }: Props) {
	const pathname = usePathname();

	const links: UserZoneNavLinkProps[] = [
		{
			text: "Lançamentos",
			url: "/transactions",
			icon: BanknoteIcon,
			selected: pathname === "/transactions",
		},
		{
			text: "Categorias",
			url: "/categories",
			icon: TagIcon,
			selected: pathname === "/categories",
		},
		{
			text: "Contas Bancárias",
			url: "/bank-accounts",
			icon: LandmarkIcon,
			selected: pathname === "/bank-accounts",
		},
		{
			text: "Perfil",
			url: "/profile",
			icon: UserIcon,
			selected: pathname === "/profile",
		},
	];

	return (
		<div className="w-full h-full flex flex-col">
			<UserHeader />
			<div className="w-full h-full flex items-start justify-start">
				<aside className="h-full hidden w-3/5 lg:w-1/5 sm:flex flex-col border-r border-border px-2 py-4 gap-2">
					{links.map((props) => (
						<UserZoneNavLink
							key={`UserZone-nav-link-${props.url}`}
							{...props}
						/>
					))}
				</aside>
				<main className="w-full h-full flex flex-col">{children}</main>
			</div>
		</div>
	);
}
