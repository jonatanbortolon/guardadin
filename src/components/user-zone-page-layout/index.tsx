import type { PropsWithChildren } from "react";
import { DocumentTitle } from "@/components/document-title";
import { Button, type Props as ButtonProps } from "@/components/ui/button";

type Props = PropsWithChildren<{
	title: string;
	description: string;
	actions?: (ButtonProps & { id: string })[];
}>;

export function UserZonePageLayout({
	title,
	description,
	actions,
	children,
}: Props) {
	return (
		<>
			<DocumentTitle title={title} />
			<div className="w-full flex justify-between items-center px-6 sm:px-16 py-8 border-b border-border">
				<div className="w-full">
					<h2 className="text-2xl font-bold">{title}</h2>
					<span className="text-muted-foreground">{description}</span>
				</div>
				{actions?.map(({ id, ...action }) => (
					<Button key={id} {...action} />
				))}
			</div>
			<div className="w-full flex flex-col px-6 py-5">{children}</div>
		</>
	);
}
