import { Toaster } from "@/components/ui/sonner";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren;

export function ToastProvider({ children }: Props) {
	return (
		<>
			<Toaster richColors />
			{children}
		</>
	);
}
