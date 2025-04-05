"use client";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/utils/cn";
import {
	BanknoteIcon,
	LandmarkIcon,
	LucideProps,
	Menu,
	TagIcon,
	UserIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ForwardRefExoticComponent, useState } from "react";

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

export function HamburgerMenu({ buttonClassName }: Props) {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);

	const links = [
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
			<SheetContent side="left" className="w-[240px] sm:w-[300px] p-4">
				<SheetTitle>Menu</SheetTitle>
				<nav className="flex flex-col space-y-4 mt-8">
					{links.map((item) => (
						<MenuItemComponent
							key={`hamburguer-menu-item-${item.url}`}
							{...item}
						/>
					))}
				</nav>
			</SheetContent>
		</Sheet>
	);
}
