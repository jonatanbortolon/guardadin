"use client";
import type {
	ColumnDef,
	OnChangeFn,
	SortingState,
} from "@tanstack/react-table";
import {
	LoaderCircleIcon,
	PencilIcon,
	PlusIcon,
	Trash2Icon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
	parseAsInteger,
	parseAsString,
	parseAsStringLiteral,
	useQueryState,
} from "nuqs";
import { type FormEvent, useEffect, useState } from "react";
import { CountryFlag } from "@/components/country-flag";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { Switch } from "@/components/ui/switch";
import { UserZonePageLayout } from "@/components/user-zone-page-layout";
import {
	UserPermission,
	type UserPermissionType,
} from "@/enums/user-permission";
import { useMe } from "@/hooks/use-auth";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useToggleBotAllowed } from "@/hooks/use-phones";
import {
	useCreateInvite,
	useDeleteUser,
	useUpdateUserPermission,
	useUsers,
} from "@/hooks/use-users";
import { ApiError } from "@/libs/fetcher";
import type { PublicUser } from "@/libs/user";
import { formatDate } from "@/utils/format-date";
import { formatPhone } from "@/utils/format-phone";

const PER_PAGE = 10;
const SORT_COLUMNS = ["createdAt", "updatedAt", "email", "name"] as const;
const SORT_DIRECTIONS = ["asc", "desc"] as const;

function getFieldErrors(error: unknown) {
	return error instanceof ApiError ? error.errors : undefined;
}

export default function Page() {
	const t = useTranslations();
	const router = useRouter();
	const me = useMe();

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

	useEffect(() => {
		if (me.data === null || (me.data && !me.data.isAdmin)) {
			router.replace("/dashboard");
		}
	}, [me.data, router]);

	const { data, isFetching, isError } = useUsers({
		page,
		perPage: PER_PAGE,
		q,
		sortBy,
		sortDir,
	});

	const createInvite = useCreateInvite();
	const updatePermission = useUpdateUserPermission();
	const deleteUser = useDeleteUser();
	const toggleBot = useToggleBotAllowed();

	const [inviteForm, setInviteForm] = useState<{
		email: string;
		permission: UserPermissionType;
	} | null>(null);
	const [editForm, setEditForm] = useState<{
		id: number;
		permission: UserPermissionType;
	} | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<PublicUser | null>(null);

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

	function permissionLabel(permission: UserPermissionType) {
		return permission === UserPermission.ALL
			? t("permissions.all")
			: t("permissions.readOnly");
	}

	function openInvite() {
		createInvite.reset();
		setInviteForm({ email: "", permission: UserPermission.READ_ONLY });
	}

	function submitInvite(event: FormEvent) {
		event.preventDefault();
		if (!inviteForm) {
			return;
		}

		createInvite.mutate(inviteForm, {
			onSuccess: () => {
				setInviteForm(null);
				toast.success(t("users.inviteSent"));
			},
			onError: toastServerError,
		});
	}

	function submitEdit(event: FormEvent) {
		event.preventDefault();
		if (!editForm) {
			return;
		}

		updatePermission.mutate(editForm, {
			onSuccess: () => setEditForm(null),
			onError: toastServerError,
		});
	}

	function confirmDelete() {
		if (!deleteTarget) {
			return;
		}

		deleteUser.mutate(deleteTarget.id, {
			onSuccess: () => setDeleteTarget(null),
			onError: toastServerError,
		});
	}

	const inviteErrors = getFieldErrors(createInvite.error);

	const columns: ColumnDef<PublicUser>[] = [
		{ accessorKey: "name", header: t("common.name") },
		{ accessorKey: "email", header: t("auth.email") },
		{
			id: "phone",
			header: t("phones.columnPhone"),
			enableSorting: false,
			cell: ({ row }) => {
				const { country, formatted } = formatPhone(row.original.phone);

				return (
					<span className="inline-flex items-center gap-2 whitespace-nowrap">
						{country ? <CountryFlag country={country} /> : null}
						{formatted}
					</span>
				);
			},
		},
		{
			id: "permission",
			header: t("users.columnPermission"),
			enableSorting: false,
			cell: ({ row }) =>
				row.original.isAdmin
					? t("users.admin")
					: permissionLabel(row.original.permission),
		},
		{
			id: "confirmed",
			header: t("users.columnConfirmed"),
			enableSorting: false,
			cell: ({ row }) =>
				row.original.emailConfirmedAt
					? t("users.confirmedYes")
					: t("users.confirmedNo"),
		},
		{
			id: "botAllowed",
			header: t("phones.columnBotAllowed"),
			enableSorting: false,
			cell: ({ row }) => (
				<div className="flex items-center gap-2">
					<Switch
						checked={row.original.botAllowed}
						disabled={toggleBot.isPending}
						onCheckedChange={(checked) =>
							toggleBot.mutate(
								{ id: row.original.id, botAllowed: checked },
								{ onError: toastServerError },
							)
						}
					/>
					<span className="text-sm text-muted-foreground">
						{row.original.botAllowed
							? t("phones.allowed")
							: t("phones.blocked")}
					</span>
				</div>
			),
		},
		{
			accessorKey: "createdAt",
			header: t("common.createdAt"),
			cell: ({ row }) => formatDate(new Date(row.original.createdAt)),
		},
		{
			id: "actions",
			header: "",
			enableSorting: false,
			cell: ({ row }) =>
				row.original.isAdmin ? (
					<div className="h-9 w-9" />
				) : (
					<div className="flex justify-end">
						<Button
							size="icon"
							variant="ghost"
							onClick={() => {
								updatePermission.reset();
								setEditForm({
									id: row.original.id,
									permission: row.original.permission,
								});
							}}
						>
							<PencilIcon />
						</Button>
						<Button
							size="icon"
							variant="ghost"
							className="text-destructive hover:text-destructive"
							onClick={() => setDeleteTarget(row.original)}
						>
							<Trash2Icon />
						</Button>
					</div>
				),
		},
	];

	return (
		<UserZonePageLayout
			title={t("admin.title")}
			description={t("admin.description")}
		>
			<Dialog
				open={inviteForm !== null}
				onOpenChange={(open) => !open && setInviteForm(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("users.inviteTitle")}</DialogTitle>
						<DialogDescription>
							{t("users.inviteDescription")}
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={submitInvite} className="flex flex-col gap-4">
						<div className="grid gap-2">
							<Label>{t("auth.email")}</Label>
							<Input
								type="email"
								value={inviteForm?.email || ""}
								onChange={(event) =>
									setInviteForm((old) =>
										old ? { ...old, email: event.target.value } : old,
									)
								}
							/>
							<p className="text-destructive text-sm">
								{inviteErrors?.email?.[0]}
							</p>
						</div>
						<div className="grid gap-2">
							<Label>{t("users.columnPermission")}</Label>
							<Select
								value={inviteForm?.permission}
								onValueChange={(value) =>
									setInviteForm((old) =>
										old
											? { ...old, permission: value as UserPermissionType }
											: old,
									)
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={UserPermission.READ_ONLY}>
										{t("permissions.readOnly")}
									</SelectItem>
									<SelectItem value={UserPermission.ALL}>
										{t("permissions.all")}
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<Button type="submit" disabled={createInvite.isPending}>
							{createInvite.isPending ? (
								<LoaderCircleIcon className="animate-spin" />
							) : null}
							{t("users.createInvite")}
						</Button>
					</form>
				</DialogContent>
			</Dialog>

			<Dialog
				open={editForm !== null}
				onOpenChange={(open) => !open && setEditForm(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("users.editTitle")}</DialogTitle>
						<DialogDescription>{t("users.description")}</DialogDescription>
					</DialogHeader>
					<form onSubmit={submitEdit} className="flex flex-col gap-4">
						<div className="grid gap-2">
							<Label>{t("users.columnPermission")}</Label>
							<Select
								value={editForm?.permission}
								onValueChange={(value) =>
									setEditForm((old) =>
										old
											? { ...old, permission: value as UserPermissionType }
											: old,
									)
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={UserPermission.READ_ONLY}>
										{t("permissions.readOnly")}
									</SelectItem>
									<SelectItem value={UserPermission.ALL}>
										{t("permissions.all")}
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<Button type="submit" disabled={updatePermission.isPending}>
							{updatePermission.isPending ? (
								<LoaderCircleIcon className="animate-spin" />
							) : null}
							{t("common.update")}
						</Button>
					</form>
				</DialogContent>
			</Dialog>

			<Dialog
				open={deleteTarget !== null}
				onOpenChange={(open) => !open && setDeleteTarget(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("users.deleteUser")}</DialogTitle>
						<DialogDescription>
							{t("users.deleteDescription", {
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
							disabled={deleteUser.isPending}
							onClick={confirmDelete}
						>
							{deleteUser.isPending ? (
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
					placeholder={t("common.search")}
				/>
				<Button onClick={openInvite}>
					{t("users.inviteButton")}
					<PlusIcon className="h-6 w-6" />
				</Button>
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
