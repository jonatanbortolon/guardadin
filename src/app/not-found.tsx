"use client";
import { DefaultHeader } from "@/components/default-header";
import { Button } from "@/components/ui/button";
import { BombIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
	const router = useRouter();

	return (
		<div className="w-full h-full items-start">
			<DefaultHeader />
			<div className="w-full h-full flex flex-col items-center justify-center gap-4 px-6 py-5">
				<BombIcon className="w-10 h-10" />
				<h2 className="font-semibold text-xl">
					Parece que não encontramos nada aqui
				</h2>
				<Button className="mt-10" onClick={router.back}>
					Voltar
				</Button>
			</div>
		</div>
	);
}
