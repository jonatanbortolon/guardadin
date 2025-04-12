import { Button, type Props as ButtonProps } from "@/components/ui/button";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
	title: string;
	description: string;
	actions?: ButtonProps[];
}>;

export function UserZonePageLayout({
	title,
	description,
	actions,
	children,
}: Props) {
	return (
		<>
			<div className="w-full flex justify-between items-center px-6 sm:px-16 py-8 border-b border-border">
				<div className="w-full">
					<h2 className="text-2xl font-bold">{title}</h2>
					<span className="text-muted-foreground">{description}</span>
				</div>
				{actions?.map((action, index) => (
					<Button key={`action-${index}`} {...action} />
				))}
			</div>
			<div className="w-full flex flex-col px-6 py-5">{children}</div>
		</>
	);
}
