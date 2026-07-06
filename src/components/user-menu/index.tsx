"use client";
import { LogOutIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLogout, useMe } from "@/hooks/use-auth";
import { cn } from "@/utils/cn";

type Props = {
	className?: string;
};

export function UserMenu({ className }: Props) {
	const t = useTranslations("auth");
	const router = useRouter();
	const me = useMe();
	const logout = useLogout();

	function handleLogout() {
		logout.mutate(undefined, {
			onSuccess: () => router.replace("/login"),
		});
	}

	return (
		<div className={cn("flex flex-col", className)}>
			<div className="border-t border-border" />
			<div className="flex items-center justify-between gap-2 px-2 pt-3">
				{me.data ? (
					<Link
						href="/profile"
						className="flex min-w-0 flex-1 flex-col gap-0.5 rounded-md bg-accent/50 px-4 py-3.5 transition-colors hover:bg-accent"
						title={t("profileNav")}
					>
						<span className="truncate text-sm font-medium leading-tight">
							{me.data.name}
						</span>
						<span className="truncate text-xs text-muted-foreground leading-normal">
							{me.data.email}
						</span>
					</Link>
				) : (
					<div className="flex min-w-0 flex-1 flex-col gap-1.5 py-1">
						<Skeleton className="h-3.5 w-24" />
						<Skeleton className="h-3 w-32" />
					</div>
				)}
				<Button
					variant="ghost"
					size="icon"
					className="h-auto w-11 shrink-0 self-stretch text-destructive hover:text-destructive"
					onClick={handleLogout}
					disabled={logout.isPending}
					aria-label={t("logout")}
				>
					<LogOutIcon />
				</Button>
			</div>
		</div>
	);
}
