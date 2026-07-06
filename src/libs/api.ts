import { NextResponse } from "next/server";
import type { SortDirection } from "@/types/api";

export type { ListResult, SortDirection } from "@/types/api";

export function jsonError(message: string, status = 400) {
	return NextResponse.json({ message }, { status });
}

export function parsePagination(searchParams: URLSearchParams) {
	const page = Math.max(1, Number(searchParams.get("page")) || 1);
	const perPage = Math.min(
		50,
		Math.max(1, Number(searchParams.get("perPage")) || 10),
	);

	return { page, perPage, offset: (page - 1) * perPage };
}

export function parseSort<Column extends string>(
	searchParams: URLSearchParams,
	allowed: readonly Column[],
	fallback: { column: Column; direction: SortDirection },
) {
	const requested = searchParams.get("sortBy");
	const column =
		requested && allowed.includes(requested as Column)
			? (requested as Column)
			: fallback.column;
	const direction: SortDirection =
		searchParams.get("sortDir") === "asc" ? "asc" : "desc";

	return { column, direction };
}

export function parseNumberList(
	searchParams: URLSearchParams,
	key: string,
): number[] {
	return searchParams
		.getAll(key)
		.flatMap((value) => value.split(","))
		.map((value) => Number(value))
		.filter((value) => Number.isFinite(value));
}
