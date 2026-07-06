"use client";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	type OnChangeFn,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/utils/cn";

const SKELETON_ROW_KEYS = ["r1", "r2", "r3", "r4", "r5"];
const SKELETON_WIDTHS = ["w-3/5", "w-2/5", "w-1/2", "w-3/5", "w-1/3", "w-2/5"];

type Props<TData, TValue> = {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	sorting: SortingState;
	onSortingChange: OnChangeFn<SortingState>;
	isLoading?: boolean;
};

export function DataTable<TData, TValue>({
	columns,
	data,
	sorting,
	onSortingChange,
	isLoading,
}: Props<TData, TValue>) {
	const t = useTranslations("common");

	const table = useReactTable({
		data,
		columns,
		state: { sorting },
		onSortingChange,
		manualSorting: true,
		manualPagination: true,
		manualFiltering: true,
		enableSortingRemoval: false,
		sortDescFirst: true,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<Table>
			<TableHeader>
				{table.getHeaderGroups().map((headerGroup) => (
					<TableRow key={headerGroup.id}>
						{headerGroup.headers.map((header) => {
							const sorted = header.column.getIsSorted();

							if (header.isPlaceholder) {
								return <TableHead key={header.id} />;
							}

							if (!header.column.getCanSort()) {
								return (
									<TableHead key={header.id}>
										{flexRender(
											header.column.columnDef.header,
											header.getContext(),
										)}
									</TableHead>
								);
							}

							return (
								<TableHead key={header.id}>
									<button
										type="button"
										className="inline-flex items-center gap-1 hover:text-foreground"
										onClick={header.column.getToggleSortingHandler()}
									>
										{flexRender(
											header.column.columnDef.header,
											header.getContext(),
										)}
										{sorted === "asc" ? (
											<ArrowUpIcon className="h-3.5 w-3.5" />
										) : sorted === "desc" ? (
											<ArrowDownIcon className="h-3.5 w-3.5" />
										) : (
											<ChevronsUpDownIcon className="h-3.5 w-3.5 opacity-50" />
										)}
									</button>
								</TableHead>
							);
						})}
					</TableRow>
				))}
			</TableHeader>
			<TableBody>
				{isLoading ? (
					SKELETON_ROW_KEYS.map((rowKey) => (
						<TableRow key={rowKey}>
							{table.getVisibleLeafColumns().map((column, index) => (
								<TableCell key={`${rowKey}-${column.id}`}>
									<Skeleton
										className={cn(
											"h-8",
											SKELETON_WIDTHS[index % SKELETON_WIDTHS.length],
										)}
									/>
								</TableCell>
							))}
						</TableRow>
					))
				) : table.getRowModel().rows.length ? (
					table.getRowModel().rows.map((row) => (
						<TableRow key={row.id}>
							{row.getVisibleCells().map((cell) => (
								<TableCell key={cell.id}>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</TableCell>
							))}
						</TableRow>
					))
				) : (
					<TableRow>
						<TableCell
							colSpan={columns.length}
							className="h-24 text-center text-muted-foreground"
						>
							{t("noResults")}
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}

type PaginationProps = {
	page: number;
	perPage: number;
	total: number;
	onPageChange: (page: number) => void;
};

export function DataTablePagination({
	page,
	perPage,
	total,
	onPageChange,
}: PaginationProps) {
	const t = useTranslations("common");
	const totalPages = Math.max(1, Math.ceil(total / perPage));

	return (
		<div className="flex items-center justify-between gap-4 py-4">
			<p className="text-sm text-muted-foreground">
				{t("pageOf", { page, total: totalPages })}
			</p>
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					disabled={page <= 1}
					onClick={() => onPageChange(page - 1)}
				>
					{t("previous")}
				</Button>
				<Button
					variant="outline"
					size="sm"
					disabled={page >= totalPages}
					onClick={() => onPageChange(page + 1)}
				>
					{t("next")}
				</Button>
			</div>
		</div>
	);
}
