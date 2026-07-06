"use client";
import { useEffect } from "react";

type Props = {
	title: string;
};

export function DocumentTitle({ title }: Props) {
	useEffect(() => {
		document.title = `GuardaDin - ${title}`;
	}, [title]);

	return null;
}
