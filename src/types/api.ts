export type SortDirection = "asc" | "desc";

export type ListResult<T> = {
	data: T[];
	total: number;
	page: number;
	perPage: number;
};
