import type { PropsWithChildren } from "react";
import { Toaster } from "@/components/ui/sonner";

type Props = PropsWithChildren;

export function ToastProvider({ children }: Props) {
	return (
		<>
			<Toaster richColors />
			{children}
		</>
	);
}
