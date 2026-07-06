"use client";
import {
	BanknoteIcon,
	ChartLineIcon,
	LandmarkIcon,
	type LucideProps,
	Menu,
	ShieldIcon,
	TagIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { type ForwardRefExoticComponent, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { UserMenu } from "@/components/user-menu";
import { useMe } from "@/hooks/use-auth";
import { cn } from "@/utils/cn";

type MenuItemProps = {
	text: string;
	url: string;
	icon: ForwardRefExoticComponent<
		Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
	>;
	selected?: boolean;
};

function MenuItemComponent({
	text,
	url,
	icon: Icon,
	selected = false,
}: MenuItemProps) {
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

type Props = {
	buttonClassName?: string;
};

const NAV_SKELETON_KEYS = ["nav-1", "nav-2", "nav-3", "nav-4", "nav-5"];

export function HamburgerMenu({ buttonClassName }: Props) {
	const t = useTranslations("nav");
	const pathname = usePathname();
	const me = useMe();
	const [open, setOpen] = useState(false);

	const links = [
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
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className={cn("md:hidden", buttonClassName)}
				>
					<Menu />
					<span className="sr-only">Abrir/fechar menu</span>
				</Button>
			</SheetTrigger>
			<SheetContent
				side="left"
				className="flex flex-col w-[240px] sm:w-[300px] p-4"
			>
				<SheetTitle>Menu</SheetTitle>
				<nav className="flex flex-col space-y-4 mt-8">
					{me.isPending
						? NAV_SKELETON_KEYS.map((key) => (
								<Skeleton key={key} className="h-9 w-full" />
							))
						: links.map((item) => (
								<MenuItemComponent
									key={`hamburguer-menu-item-${item.url}`}
									{...item}
								/>
							))}
				</nav>
				<UserMenu className="mt-auto" />
			</SheetContent>
		</Sheet>
	);
}
