"use client";
import type {
	ColumnDef,
	OnChangeFn,
	SortingState,
} from "@tanstack/react-table";
import { LoaderCircleIcon, PencilIcon, PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import {
	parseAsInteger,
	parseAsString,
	parseAsStringLiteral,
	useQueryState,
} from "nuqs";
import { type FormEvent, useEffect, useState } from "react";
import { DataTable, DataTablePagination } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { Switch } from "@/components/ui/switch";
import { UserZonePageLayout } from "@/components/user-zone-page-layout";
import { UserPermission } from "@/enums/user-permission";
import { useMe } from "@/hooks/use-auth";
import {
	useCategories,
	useCreateCategory,
	useDefaultCategory,
	useDeleteCategory,
	useUpdateCategory,
} from "@/hooks/use-categories";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { Category } from "@/kysely/types/category";
import { ApiError } from "@/libs/fetcher";
import { formatDate } from "@/utils/format-date";

const PER_PAGE = 10;
const SORT_COLUMNS = ["createdAt", "updatedAt", "name"] as const;
const SORT_DIRECTIONS = ["asc", "desc"] as const;

function getFieldErrors(error: unknown) {
	return error instanceof ApiError ? error.errors : undefined;
}

export default function Page() {
	const t = useTranslations();
	const me = useMe();
	const canWrite =
		!!me.data && (me.data.isAdmin || me.data.permission === UserPermission.ALL);

	const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
	const [q, setQ] = useQueryState("q", parseAsString.withDefault(""));
	const [sortBy, setSortBy] = useQueryState(
		"sortBy",
		parseAsStringLiteral(SORT_COLUMNS).withDefault("createdAt"),
	);
	const [sortDir, setSortDir] = useQueryState(
		"sortDir",
		parseAsStringLiteral(SORT_DIRECTIONS).withDefault("desc"),
	);

	const [search, setSearch] = useState(q);
	const debouncedSearch = useDebouncedValue(search);

	useEffect(() => {
		if (debouncedSearch === q) {
			return;
		}

		setQ(debouncedSearch || null);
		setPage(1);
	}, [debouncedSearch, q, setQ, setPage]);

	const { data, isFetching, isError } = useCategories({
		page,
		perPage: PER_PAGE,
		q,
		sortBy,
		sortDir,
	});

	const defaultQuery = useDefaultCategory();
	const createMutation = useCreateCategory();
	const updateMutation = useUpdateCategory();
	const deleteMutation = useDeleteCategory();

	const [createForm, setCreateForm] = useState<{
		name: string;
		isDefault: boolean;
	} | null>(null);
	const [updateForm, setUpdateForm] = useState<{
		id: number;
		name: string;
		isDefault: boolean;
	} | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

	useEffect(() => {
		if (isError) {
			toast.error(t("common.serverError"));
		}
	}, [isError, t]);

	function toastServerError(error: unknown) {
		if (error instanceof ApiError && error.errors) {
			return;
		}

		toast.error(
			error instanceof Error ? error.message : t("common.serverError"),
		);
	}

	const sorting: SortingState = [{ id: sortBy, desc: sortDir === "desc" }];

	const onSortingChange: OnChangeFn<SortingState> = (updater) => {
		const next = typeof updater === "function" ? updater(sorting) : updater;
		const first = next[0];

		if (!first) {
			return;
		}

		setSortBy(first.id as (typeof SORT_COLUMNS)[number]);
		setSortDir(first.desc ? "desc" : "asc");
		setPage(1);
	};

	function openCreate() {
		createMutation.reset();
		setCreateForm({ name: "", isDefault: false });
	}

	function openUpdate(category: Category) {
		updateMutation.reset();
		setUpdateForm({
			id: category.id,
			name: category.name,
			isDefault: category.isDefault,
		});
	}

	function submitCreate(event: FormEvent) {
		event.preventDefault();
		if (!createForm) {
			return;
		}

		createMutation.mutate(createForm, {
			onSuccess: () => setCreateForm(null),
			onError: toastServerError,
		});
	}

	function submitUpdate(event: FormEvent) {
		event.preventDefault();
		if (!updateForm) {
			return;
		}

		updateMutation.mutate(updateForm, {
			onSuccess: () => setUpdateForm(null),
			onError: toastServerError,
		});
	}

	function confirmDelete() {
		if (!deleteTarget) {
			return;
		}

		deleteMutation.mutate(deleteTarget.id, {
			onSuccess: () => {
				setDeleteTarget(null);
				setUpdateForm(null);
			},
			onError: toastServerError,
		});
	}

	const createErrors = getFieldErrors(createMutation.error);
	const updateErrors = getFieldErrors(updateMutation.error);
	const defaultCategory = defaultQuery.data;

	const columns: ColumnDef<Category>[] = [
		{
			accessorKey: "name",
			header: t("common.name"),
		},
		{
			accessorKey: "createdAt",
			header: t("common.createdAt"),
			cell: ({ row }) => formatDate(new Date(row.original.createdAt)),
		},
		{
			accessorKey: "updatedAt",
			header: t("common.updatedAt"),
			cell: ({ row }) => formatDate(new Date(row.original.updatedAt)),
		},
	];

	if (canWrite) {
		columns.push({
			id: "actions",
			header: "",
			enableSorting: false,
			cell: ({ row }) => (
				<div className="text-right">
					<Button
						size="icon"
						variant="ghost"
						onClick={() => openUpdate(row.original)}
					>
						<PencilIcon />
					</Button>
				</div>
			),
		});
	}

	return (
		<UserZonePageLayout
			title={t("categories.title")}
			description={t("categories.description")}
			actions={
				canWrite
					? [
							{
								id: "create",
								children: (
									<>
										{t("categories.createButton")}
										<PlusIcon className="h-6 w-6" />
									</>
								),
								onClick: openCreate,
							},
						]
					: undefined
			}
		>
			<Dialog
				open={createForm !== null}
				onOpenChange={(open) => !open && setCreateForm(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("categories.createTitle")}</DialogTitle>
						<DialogDescription>
							{t("categories.createDescription")}
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={submitCreate}>
						<div className="flex flex-col gap-2">
							<div className="grid gap-2">
								<Label>{t("common.name")}</Label>
								<Input
									value={createForm?.name || ""}
									onChange={(event) =>
										setCreateForm((old) =>
											old ? { ...old, name: event.target.value } : old,
										)
									}
									placeholder={t("categories.namePlaceholder")}
								/>
								<p className="text-destructive text-sm">
									{createErrors?.name?.[0]}
								</p>
							</div>
							<div className="grid gap-2">
								<div className="space-y-2">
									<Label>{t("categories.isDefaultLabel")}</Label>
									<p className="text-[0.8rem] text-muted-foreground">
										{t("categories.isDefaultHelp")}
									</p>
								</div>
								<Switch
									checked={createForm?.isDefault || false}
									onCheckedChange={(checked) =>
										setCreateForm((old) =>
											old ? { ...old, isDefault: checked } : old,
										)
									}
								/>
								{createForm?.isDefault &&
								(defaultQuery.isFetching || defaultCategory) ? (
									<p className="rounded-md border border-yellow-500/50 bg-yellow-100 px-3 py-2 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
										{defaultQuery.isFetching ? (
											<span className="inline-block h-3 w-24 animate-pulse rounded bg-yellow-500/40 align-middle" />
										) : (
											t("categories.replaceDefault", {
												name: defaultCategory?.name ?? "",
											})
										)}
									</p>
								) : null}
							</div>
							<Button
								type="submit"
								className="w-full"
								disabled={createMutation.isPending}
							>
								{createMutation.isPending ? (
									<LoaderCircleIcon className="animate-spin" />
								) : null}
								{t("common.create")}
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>

			<Dialog
				open={updateForm !== null && deleteTarget === null}
				onOpenChange={(open) => !open && setUpdateForm(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("categories.updateTitle")}</DialogTitle>
						<DialogDescription>
							{t("categories.updateDescription")}
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={submitUpdate}>
						<div className="flex flex-col gap-2">
							<div className="grid gap-2">
								<Label>{t("common.name")}</Label>
								<Input
									value={updateForm?.name || ""}
									onChange={(event) =>
										setUpdateForm((old) =>
											old ? { ...old, name: event.target.value } : old,
										)
									}
									placeholder={t("categories.namePlaceholder")}
								/>
								<p className="text-destructive text-sm">
									{updateErrors?.name?.[0]}
								</p>
							</div>
							<div className="grid gap-2">
								<div className="space-y-2">
									<Label>{t("categories.isDefaultLabel")}</Label>
									<p className="text-[0.8rem] text-muted-foreground">
										{t("categories.isDefaultHelp")}
									</p>
								</div>
								<Switch
									checked={updateForm?.isDefault || false}
									onCheckedChange={(checked) =>
										setUpdateForm((old) =>
											old ? { ...old, isDefault: checked } : old,
										)
									}
								/>
								{updateForm?.isDefault &&
								(defaultQuery.isFetching ||
									(defaultCategory && defaultCategory.id !== updateForm.id)) ? (
									<p className="rounded-md border border-yellow-500/50 bg-yellow-100 px-3 py-2 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
										{defaultQuery.isFetching ? (
											<span className="inline-block h-3 w-24 animate-pulse rounded bg-yellow-500/40 align-middle" />
										) : (
											t("categories.replaceDefault", {
												name: defaultCategory?.name ?? "",
											})
										)}
									</p>
								) : null}
							</div>
							<Button
								type="submit"
								className="w-full"
								disabled={updateMutation.isPending}
							>
								{updateMutation.isPending ? (
									<LoaderCircleIcon className="animate-spin" />
								) : null}
								{t("common.update")}
							</Button>
						</div>
					</form>
					<Button
						className="w-full !border-destructive text-destructive hover:text-destructive"
						variant="outline"
						type="button"
						onClick={() =>
							updateForm &&
							setDeleteTarget({
								id: updateForm.id,
								name: updateForm.name,
								isDefault: updateForm.isDefault,
							} as Category)
						}
					>
						{t("common.delete")}
					</Button>
				</DialogContent>
			</Dialog>

			<Dialog
				open={deleteTarget !== null}
				onOpenChange={(open) => !open && setDeleteTarget(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("categories.deleteTitle")}</DialogTitle>
						<DialogDescription>
							{t("categories.deleteDescription", {
								name: deleteTarget?.name ?? "",
								id: deleteTarget?.id ?? "",
							})}
						</DialogDescription>
					</DialogHeader>
					<div className="w-full flex gap-4">
						<Button
							className="flex-1 !border-destructive text-destructive hover:text-destructive"
							variant="outline"
							type="button"
							disabled={deleteMutation.isPending}
							onClick={confirmDelete}
						>
							{deleteMutation.isPending ? (
								<LoaderCircleIcon className="animate-spin" />
							) : null}
							{t("common.delete")}
						</Button>
						<Button
							className="flex-1"
							type="button"
							onClick={() => setDeleteTarget(null)}
						>
							{t("common.cancel")}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			<div className="flex items-center justify-between gap-4 pb-4">
				<Input
					className="max-w-xs"
					value={search}
					onChange={(event) => setSearch(event.target.value)}
					placeholder={t("categories.searchPlaceholder")}
				/>
			</div>

			<DataTable
				columns={columns}
				data={data?.data ?? []}
				sorting={sorting}
				onSortingChange={onSortingChange}
				isLoading={isFetching}
			/>

			<DataTablePagination
				page={page}
				perPage={PER_PAGE}
				total={data?.total ?? 0}
				onPageChange={setPage}
			/>
		</UserZonePageLayout>
	);
}
