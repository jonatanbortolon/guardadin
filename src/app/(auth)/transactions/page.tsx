"use client";
import type {
	ColumnDef,
	OnChangeFn,
	SortingState,
} from "@tanstack/react-table";
import { endOfMonth, format, startOfMonth } from "date-fns";
import {
	CalendarIcon,
	ChevronDownIcon,
	LoaderCircleIcon,
	PencilIcon,
	PlusIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
	parseAsArrayOf,
	parseAsInteger,
	parseAsString,
	parseAsStringLiteral,
	useQueryState,
} from "nuqs";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { CurrencyInput } from "react-currency-mask";
import type { DateRange } from "react-day-picker";
import { DataTable, DataTablePagination } from "@/components/data-table";
import { MultiSelect } from "@/components/multi-select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { UserZonePageLayout } from "@/components/user-zone-page-layout";
import { UserPermission } from "@/enums/user-permission";
import { useMe } from "@/hooks/use-auth";
import { useAllBankAccounts } from "@/hooks/use-bank-accounts";
import { useAllCategories } from "@/hooks/use-categories";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
	type TransactionWithParcels,
	useCreateTransaction,
	useDeleteTransaction,
	useTransactions,
	useUpdateTransaction,
} from "@/hooks/use-transactions";
import type { Transaction } from "@/kysely/types/transaction";
import { ApiError } from "@/libs/fetcher";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/format-date";
import { formatPrice } from "@/utils/format-price";

const PER_PAGE = 10;
const SORT_COLUMNS = [
	"total",
	"totalParcels",
	"boughtAt",
	"monthAmount",
	"dueDate",
] as const;
const SORT_DIRECTIONS = ["asc", "desc"] as const;

type FormValues = {
	description: string;
	total: number;
	totalParcels: number;
	type: "INCOME" | "EXPENSE";
	boughtAt: Date;
	categoryId: number | null;
	bankAccountId: number | null;
};

function emptyForm(): FormValues {
	return {
		description: "",
		total: 0,
		totalParcels: 1,
		type: "EXPENSE",
		boughtAt: new Date(),
		categoryId: null,
		bankAccountId: null,
	};
}

function getFieldErrors(error: unknown) {
	return error instanceof ApiError ? error.errors : undefined;
}

type TransactionFormProps = {
	values: FormValues;
	onChange: (patch: Partial<FormValues>) => void;
	onSubmit: (event: FormEvent) => void;
	isPending: boolean;
	submitLabel: string;
	errors: Record<string, string[] | undefined> | undefined;
	categories: { id: number; name: string }[];
	bankAccounts: { id: number; name: string }[];
};

function TransactionForm({
	values,
	onChange,
	onSubmit,
	isPending,
	submitLabel,
	errors,
	categories,
	bankAccounts,
}: TransactionFormProps) {
	const t = useTranslations();

	return (
		<form onSubmit={onSubmit}>
			<div className="flex flex-col gap-2">
				<div className="grid gap-2">
					<Label>{t("transactions.descriptionLabel")}</Label>
					<Input
						value={values.description}
						onChange={(event) => onChange({ description: event.target.value })}
						placeholder={t("transactions.descriptionPlaceholder")}
					/>
					<p className="text-destructive text-sm">{errors?.description?.[0]}</p>
				</div>
				<div className="grid gap-2">
					<Label>{t("transactions.total")}</Label>
					<CurrencyInput
						value={values.total}
						onChangeValue={(_event, originalValue) =>
							onChange({ total: Number(originalValue) })
						}
						InputElement={<Input placeholder="Ex: 1000" />}
					/>
					<p className="text-destructive text-sm">{errors?.total?.[0]}</p>
				</div>
				{values.type === "EXPENSE" ? (
					<div className="grid gap-2">
						<Label>{t("transactions.parcels")}</Label>
						<Input
							value={values.totalParcels || ""}
							onChange={(event) =>
								onChange({ totalParcels: Number(event.target.value) })
							}
							type="number"
							placeholder="Ex: 1"
						/>
						<p className="text-destructive text-sm">
							{errors?.totalParcels?.[0]}
						</p>
					</div>
				) : null}
				<div className="grid gap-2">
					<Label>{t("transactions.type")}</Label>
					<Select
						value={values.type}
						onValueChange={(value) => {
							const type = value as FormValues["type"];
							onChange(
								type === "INCOME" ? { type, totalParcels: 1 } : { type },
							);
						}}
					>
						<SelectTrigger className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="EXPENSE">
								{t("transactions.expense")}
							</SelectItem>
							<SelectItem value="INCOME">{t("transactions.income")}</SelectItem>
						</SelectContent>
					</Select>
					<p className="text-destructive text-sm">{errors?.type?.[0]}</p>
				</div>
				<div className="grid gap-2">
					<Label>{t("transactions.boughtAt")}</Label>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								className={cn(
									"text-left font-normal",
									!values.boughtAt && "text-muted-foreground",
								)}
							>
								{values.boughtAt ? (
									formatDate(values.boughtAt)
								) : (
									<span>{t("transactions.selectDate")}</span>
								)}
								<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0" align="start">
							<Calendar
								mode="single"
								selected={values.boughtAt}
								onSelect={(value) => value && onChange({ boughtAt: value })}
							/>
						</PopoverContent>
					</Popover>
					<p className="text-destructive text-sm">{errors?.boughtAt?.[0]}</p>
				</div>
				<div className="grid gap-2">
					<Label>{t("transactions.category")}</Label>
					<Select
						value={
							values.categoryId === null ? "null" : String(values.categoryId)
						}
						onValueChange={(value) =>
							onChange({ categoryId: value === "null" ? null : Number(value) })
						}
					>
						<SelectTrigger className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="null">
								{t("transactions.noCategory")}
							</SelectItem>
							{categories.map((category) => (
								<SelectItem key={category.id} value={String(category.id)}>
									{category.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<p className="text-destructive text-sm">{errors?.categoryId?.[0]}</p>
				</div>
				<div className="grid gap-2">
					<Label>{t("transactions.bankAccount")}</Label>
					<Select
						value={
							values.bankAccountId === null
								? "null"
								: String(values.bankAccountId)
						}
						onValueChange={(value) =>
							onChange({
								bankAccountId: value === "null" ? null : Number(value),
							})
						}
					>
						<SelectTrigger className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="null">
								{t("transactions.noBankAccount")}
							</SelectItem>
							{bankAccounts.map((bankAccount) => (
								<SelectItem key={bankAccount.id} value={String(bankAccount.id)}>
									{bankAccount.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<p className="text-destructive text-sm">
						{errors?.bankAccountId?.[0]}
					</p>
				</div>
				<Button type="submit" className="w-full" disabled={isPending}>
					{isPending ? <LoaderCircleIcon className="animate-spin" /> : null}
					{submitLabel}
				</Button>
			</div>
		</form>
	);
}

export default function Page() {
	const t = useTranslations();
	const me = useMe();
	const canWrite =
		!!me.data && (me.data.isAdmin || me.data.permission === UserPermission.ALL);

	const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
	const [description, setDescription] = useQueryState(
		"description",
		parseAsString.withDefault(""),
	);
	const [categoryIds, setCategoryIds] = useQueryState(
		"categoryId",
		parseAsArrayOf(parseAsInteger).withDefault([]),
	);
	const [bankAccountIds, setBankAccountIds] = useQueryState(
		"bankAccountId",
		parseAsArrayOf(parseAsInteger).withDefault([]),
	);
	const [sortBy, setSortBy] = useQueryState(
		"sortBy",
		parseAsStringLiteral(SORT_COLUMNS).withDefault("boughtAt"),
	);
	const [sortDir, setSortDir] = useQueryState(
		"sortDir",
		parseAsStringLiteral(SORT_DIRECTIONS).withDefault("desc"),
	);
	const [from, setFrom] = useQueryState(
		"from",
		parseAsString.withDefault(format(startOfMonth(new Date()), "yyyy-MM-dd")),
	);
	const [to, setTo] = useQueryState(
		"to",
		parseAsString.withDefault(format(endOfMonth(new Date()), "yyyy-MM-dd")),
	);

	const [datePickerOpen, setDatePickerOpen] = useState(false);
	const [pendingRange, setPendingRange] = useState<DateRange | undefined>(
		undefined,
	);

	const selectedRange: DateRange = {
		from: new Date(`${from}T00:00:00`),
		to: new Date(`${to}T00:00:00`),
	};

	const rangeLabel =
		from === to
			? formatDate(selectedRange.from as Date)
			: `${formatDate(selectedRange.from as Date)} – ${formatDate(selectedRange.to as Date)}`;

	function onDatePickerOpenChange(open: boolean) {
		if (open) {
			setPendingRange(selectedRange);
		} else if (pendingRange?.from) {
			const nextFrom = format(pendingRange.from, "yyyy-MM-dd");
			const nextTo = format(pendingRange.to ?? pendingRange.from, "yyyy-MM-dd");

			if (nextFrom !== from || nextTo !== to) {
				setFrom(nextFrom);
				setTo(nextTo);
				setPage(1);
			}
		}

		setDatePickerOpen(open);
	}

	const [search, setSearch] = useState(description);
	const debouncedSearch = useDebouncedValue(search);

	useEffect(() => {
		if (debouncedSearch === description) {
			return;
		}

		setDescription(debouncedSearch || null);
		setPage(1);
	}, [debouncedSearch, description, setDescription, setPage]);

	const categoriesQuery = useAllCategories();
	const bankAccountsQuery = useAllBankAccounts();
	const categories = categoriesQuery.data ?? [];
	const bankAccounts = bankAccountsQuery.data ?? [];

	const { data, isFetching } = useTransactions({
		page,
		perPage: PER_PAGE,
		from,
		to,
		description,
		categoryId: categoryIds,
		bankAccountId: bankAccountIds,
		sortBy,
		sortDir,
	});

	const createMutation = useCreateTransaction();
	const updateMutation = useUpdateTransaction();
	const deleteMutation = useDeleteTransaction();

	const [createForm, setCreateForm] = useState<FormValues | null>(null);
	const [updateForm, setUpdateForm] = useState<
		(FormValues & { id: number }) | null
	>(null);
	const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

	const categoryMap = useMemo(
		() => new Map(categories.map((category) => [category.id, category.name])),
		[categories],
	);
	const bankAccountMap = useMemo(
		() =>
			new Map(
				bankAccounts.map((bankAccount) => [bankAccount.id, bankAccount.name]),
			),
		[bankAccounts],
	);

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

	function toInput(values: FormValues) {
		return {
			description: values.description,
			total: values.total,
			totalParcels: values.totalParcels,
			type: values.type,
			boughtAt: values.boughtAt.toISOString(),
			categoryId: values.categoryId,
			bankAccountId: values.bankAccountId,
		};
	}

	function openCreate() {
		createMutation.reset();
		setCreateForm(emptyForm());
	}

	function openUpdate(transaction: Transaction) {
		updateMutation.reset();
		setUpdateForm({
			id: transaction.id,
			description: transaction.description,
			total: Number(transaction.total),
			totalParcels: transaction.totalParcels,
			type: transaction.type,
			boughtAt: new Date(transaction.boughtAt),
			categoryId: transaction.categoryId,
			bankAccountId: transaction.bankAccountId,
		});
	}

	function submitCreate(event: FormEvent) {
		event.preventDefault();
		if (!createForm) {
			return;
		}

		createMutation.mutate(toInput(createForm), {
			onSuccess: () => setCreateForm(null),
			onError: toastServerError,
		});
	}

	function submitUpdate(event: FormEvent) {
		event.preventDefault();
		if (!updateForm) {
			return;
		}

		updateMutation.mutate(
			{ id: updateForm.id, ...toInput(updateForm) },
			{
				onSuccess: () => setUpdateForm(null),
				onError: toastServerError,
			},
		);
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

	const columns: ColumnDef<TransactionWithParcels>[] = [
		{
			accessorKey: "description",
			header: t("transactions.descriptionLabel"),
			enableSorting: false,
		},
		{
			id: "type",
			header: t("transactions.type"),
			enableSorting: false,
			cell: ({ row }) => (
				<span
					className={cn(
						row.original.type === "EXPENSE" ? "text-red-500" : "text-green-500",
					)}
				>
					{row.original.type === "EXPENSE"
						? t("transactions.expense")
						: t("transactions.income")}
				</span>
			),
		},
		{
			id: "category",
			header: t("transactions.category"),
			enableSorting: false,
			cell: ({ row }) =>
				row.original.categoryId
					? (categoryMap.get(row.original.categoryId) ?? "-")
					: "-",
		},
		{
			id: "bankAccount",
			header: t("transactions.bankAccount"),
			enableSorting: false,
			cell: ({ row }) =>
				row.original.bankAccountId
					? (bankAccountMap.get(row.original.bankAccountId) ?? "-")
					: "-",
		},
		{
			accessorKey: "monthAmount",
			header: t("transactions.total"),
			cell: ({ row }) => (
				<span
					className={cn(
						row.original.type === "EXPENSE" ? "text-red-500" : "text-green-500",
					)}
				>
					{formatPrice(Number(row.original.monthAmount))}
				</span>
			),
		},
		{
			id: "parcels",
			header: t("transactions.parcels"),
			enableSorting: false,
			cell: ({ row }) => {
				const { monthParcelNumber, totalParcels, payments } = row.original;
				const label = `${monthParcelNumber}/${totalParcels}`;

				if (totalParcels <= 1) {
					return <span className="text-muted-foreground">{label}</span>;
				}

				return (
					<Popover>
						<PopoverTrigger asChild>
							<Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
								{label}
								<ChevronDownIcon className="h-4 w-4 opacity-60" />
							</Button>
						</PopoverTrigger>
						<PopoverContent align="start" className="w-72 p-2">
							<p className="px-1 pb-1 text-xs font-medium text-muted-foreground">
								{t("transactions.parcels")}
							</p>
							<div className="flex max-h-64 flex-col overflow-y-auto">
								{payments.map((payment) => (
									<div
										key={payment.id}
										className={cn(
											"flex items-center justify-between gap-2 rounded-md px-2 py-1 text-sm",
											payment.parcelNumber === monthParcelNumber && "bg-accent",
										)}
									>
										<span className="text-muted-foreground">
											{payment.parcelNumber}/{totalParcels} ·{" "}
											{formatDate(new Date(payment.dueAt))}
										</span>
										<span>{formatPrice(Number(payment.amount))}</span>
									</div>
								))}
							</div>
						</PopoverContent>
					</Popover>
				);
			},
		},
		{
			id: "dueDate",
			accessorFn: (row) => row.monthDueAt,
			header: t("transactions.dueDate"),
			cell: ({ row }) => formatDate(new Date(row.original.monthDueAt)),
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
			title={t("transactions.title")}
			description={t("transactions.description")}
			actions={
				canWrite
					? [
							{
								id: "create",
								children: (
									<>
										{t("transactions.createButton")}
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
				<DialogContent className="max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{t("transactions.createTitle")}</DialogTitle>
						<DialogDescription>
							{t("transactions.createDescription")}
						</DialogDescription>
					</DialogHeader>
					{createForm ? (
						<TransactionForm
							values={createForm}
							onChange={(patch) =>
								setCreateForm((old) => (old ? { ...old, ...patch } : old))
							}
							onSubmit={submitCreate}
							isPending={createMutation.isPending}
							submitLabel={t("common.create")}
							errors={getFieldErrors(createMutation.error)}
							categories={categories}
							bankAccounts={bankAccounts}
						/>
					) : null}
				</DialogContent>
			</Dialog>

			<Dialog
				open={updateForm !== null && deleteTarget === null}
				onOpenChange={(open) => !open && setUpdateForm(null)}
			>
				<DialogContent className="max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{t("transactions.updateTitle")}</DialogTitle>
						<DialogDescription>
							{t("transactions.updateDescription")}
						</DialogDescription>
					</DialogHeader>
					{updateForm ? (
						<TransactionForm
							values={updateForm}
							onChange={(patch) =>
								setUpdateForm((old) => (old ? { ...old, ...patch } : old))
							}
							onSubmit={submitUpdate}
							isPending={updateMutation.isPending}
							submitLabel={t("common.update")}
							errors={getFieldErrors(updateMutation.error)}
							categories={categories}
							bankAccounts={bankAccounts}
						/>
					) : null}
					<Button
						className="w-full !border-destructive text-destructive hover:text-destructive"
						variant="outline"
						type="button"
						onClick={() =>
							updateForm &&
							setDeleteTarget({
								id: updateForm.id,
								description: updateForm.description,
							} as Transaction)
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
						<DialogTitle>{t("transactions.deleteTitle")}</DialogTitle>
						<DialogDescription>
							{t("transactions.deleteDescription", {
								name: deleteTarget?.description ?? "",
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

			<div className="flex flex-col gap-2 pb-4 md:flex-row md:items-center">
				<Popover open={datePickerOpen} onOpenChange={onDatePickerOpenChange}>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							className="justify-start text-left font-normal md:w-64"
						>
							<CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
							{rangeLabel}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0" align="start">
						<Calendar
							mode="range"
							numberOfMonths={2}
							defaultMonth={pendingRange?.from ?? selectedRange.from}
							selected={pendingRange}
							onSelect={setPendingRange}
						/>
					</PopoverContent>
				</Popover>
				<Input
					className="md:max-w-xs"
					value={search}
					onChange={(event) => setSearch(event.target.value)}
					placeholder={t("transactions.filterDescription")}
				/>
				<div className="w-full md:w-56">
					<MultiSelect
						options={categories.map((category) => ({
							value: category.id,
							label: category.name,
						}))}
						value={categoryIds}
						onChange={(value) => {
							setCategoryIds(value.length ? value : null);
							setPage(1);
						}}
						placeholder={t("transactions.filterCategory")}
						searchPlaceholder={t("common.search")}
						emptyText={t("common.noResults")}
						selectedText={(count) => t("transactions.selectedCount", { count })}
					/>
				</div>
				<div className="w-full md:w-56">
					<MultiSelect
						options={bankAccounts.map((bankAccount) => ({
							value: bankAccount.id,
							label: bankAccount.name,
						}))}
						value={bankAccountIds}
						onChange={(value) => {
							setBankAccountIds(value.length ? value : null);
							setPage(1);
						}}
						placeholder={t("transactions.filterBankAccount")}
						searchPlaceholder={t("common.search")}
						emptyText={t("common.noResults")}
						selectedText={(count) => t("transactions.selectedCount", { count })}
					/>
				</div>
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
