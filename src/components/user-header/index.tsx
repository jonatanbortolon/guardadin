"use client";
import { HamburgerMenu } from "@/components/hamburguer-menu";
import { ToggleThemeButton } from "@/components/toggle-theme-button";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { logoutAction } from "@/server-actions/logout";
import { LoaderCircleIcon } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect } from "react";

export function UserHeader() {
	const [state, action, isPending] = useActionState(logoutAction, undefined);

	useEffect(() => {
		if (!state?.message) return;

		toast.error(state.message);
	}, [state]);

	return (
		<header className="w-full px-5 py-4 border-b border-border">
			<div className="w-full h-full flex justify-between items-center">
				<HamburgerMenu buttonClassName="mr-4" />
				<Link className="flex items-center" href="/">
					<img
						src="/logo.svg"
						alt="GuardaDin"
						className="w-6 h-6 sm:w-8 sm:h-8"
					/>
					<span className="text-lg sm:text-xl font-bold ml-2 text-primary">
						GuardaDin
					</span>
				</Link>
				<div className="flex items-center gap-2">
					<form action={action}>
						<Button
							className="w-min"
							variant="destructive"
							type="submit"
							disabled={isPending}
						>
							{isPending ? <LoaderCircleIcon className="animate-spin" /> : null}
							Sair
						</Button>
					</form>
					<ToggleThemeButton />
				</div>
			</div>
		</header>
	);
}
