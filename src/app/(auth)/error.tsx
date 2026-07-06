"use client";
import { BombIcon } from "lucide-react";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
	title: "GuardaDin - Página não encontrada",
};

export default function ErrorComponent({
	error: _error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div className="w-full h-full flex flex-col items-center justify-center gap-4 px-6 py-5">
			<BombIcon className="w-10 h-10" />
			<h2 className="font-semibold text-xl">
				Aconteceu um erro, tente novamente
			</h2>
			<Button className="mt-10" onClick={reset}>
				Tentar novamente
			</Button>
		</div>
	);
}
