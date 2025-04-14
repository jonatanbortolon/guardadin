"use client";
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { UserZonePageLayout } from "@/components/user-zone-page-layout";
import { BankAccount } from "@/kysely/types/bank-account";
import { Category } from "@/kysely/types/category";
import { Transaction } from "@/kysely/types/transaction";
import { createTransactionAction } from "@/server-actions/create-transaction";
import { deleteTransactionAction } from "@/server-actions/delete-transaction";
import { updateTransactionAction } from "@/server-actions/update-transaction";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/format-date";
import { formatPrice } from "@/utils/format-price";
import {
	CalendarIcon,
	LoaderCircleIcon,
	PencilIcon,
	PlusIcon,
} from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { CurrencyInput } from "react-currency-mask";

type Props = {
	transactions: Transaction[];
	categories: Category[];
	bankAccounts: BankAccount[];
};

export function TransactionsHome({
	transactions,
	categories,
	bankAccounts,
}: Props) {
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<Omit<
		Transaction,
		"id" | "createdAt" | "updatedAt" | "userId"
	> | null>(null);
	const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState<Omit<
		Transaction,
		"createdAt" | "updatedAt" | "userId"
	> | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<Omit<
		Transaction,
		"createdAt" | "updatedAt" | "userId"
	> | null>(null);

	const [createState, createAction, isCreatePending] = useActionState(
		createTransactionAction,
		undefined,
	);
	const [updateState, updateAction, isUpdatePending] = useActionState(
		updateTransactionAction.bind(null, isUpdateDialogOpen?.id),
		undefined,
	);
	const [deleteState, deleteAction, isDeletePending] = useActionState(
		deleteTransactionAction.bind(null, isUpdateDialogOpen?.id),
		undefined,
	);

	function openCreateDialog() {
		setIsCreateDialogOpen({
			totalParcels: 1,
			description: "",
			total: 0,
			type: "EXPENSE",
			boughtAt: new Date(),
			categoryId: null,
			bankAccountId: null,
		});
	}

	function closeCreateDialog() {
		setIsCreateDialogOpen(null);
	}

	function changeCreateDialog(
		field: keyof Omit<Transaction, "id" | "createdAt" | "updatedAt" | "userId">,
		value: any,
	) {
		setIsCreateDialogOpen((old) => {
			if (!old) {
				return old;
			}

			const oldHandler = structuredClone(old);
			oldHandler[field] = value as never;
			return oldHandler;
		});
	}

	function openUpdateDialog(transaction: Transaction) {
		return () => {
			const {
				id,
				totalParcels,
				description,
				total,
				type,
				boughtAt,
				categoryId,
				bankAccountId,
			} = transaction;

			setIsUpdateDialogOpen({
				id,
				totalParcels,
				description,
				total,
				type,
				boughtAt,
				categoryId,
				bankAccountId,
			});
		};
	}

	function closeUpdateDialog() {
		setIsUpdateDialogOpen(null);
	}

	function changeUpdateDialog(
		field: keyof Omit<Transaction, "createdAt" | "updatedAt" | "userId">,
		value: any,
	) {
		setIsUpdateDialogOpen((old) => {
			if (!old) {
				return old;
			}

			const oldHandler = structuredClone(old);
			oldHandler[field] = value as never;
			return oldHandler;
		});
	}

	function toggleDeleteDialog(
		transaction?: Omit<
			Transaction,
			"createdAt" | "updatedAt" | "userId"
		> | null,
	) {
		return () => {
			if (!transaction) {
				setIsDeleteDialogOpen(null);
				return;
			}

			const {
				id,
				totalParcels,
				description,
				total,
				type,
				boughtAt,
				categoryId,
				bankAccountId,
			} = transaction;
			setIsDeleteDialogOpen({
				id,
				totalParcels,
				description,
				total,
				type,
				boughtAt,
				categoryId,
				bankAccountId,
			});
		};
	}

	useEffect(() => {
		if (!createState?.message) return;

		toast.error(createState.message);
	}, [createState]);

	useEffect(() => {
		if (!updateState?.message) return;

		toast.error(updateState.message);
	}, [updateState]);

	useEffect(() => {
		if (!deleteState?.message) return;

		toast.error(deleteState.message);
	}, [deleteState]);

	return (
		<UserZonePageLayout
			title="Lançamentos"
			description="Liste todas os seus lançamentos."
			actions={[
				{
					children: (
						<>
							Criar Transação
							<PlusIcon className="h-6 w-6" />
						</>
					),
					onClick: openCreateDialog,
				},
			]}
		>
			<Dialog
				open={isCreateDialogOpen !== null}
				onOpenChange={closeCreateDialog}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Criar Transação</DialogTitle>
						<DialogDescription>
							Crie uma transação para agregar seus gastos.
						</DialogDescription>
					</DialogHeader>
					<form action={createAction}>
						<div className="flex flex-col gap-2">
							<div className="grid gap-2">
								<Label>Nome</Label>
								<Input
									name="description"
									value={isCreateDialogOpen?.description || ""}
									onChange={(event) =>
										changeCreateDialog("description", event.target.value)
									}
									placeholder="Ex: Comprei uma TV"
								/>
								<p className="text-destructive text-sm">
									{createState?.errors?.description?.[0]}
								</p>
							</div>
							<div className="grid gap-2">
								<Label>Valor</Label>
								<input
									name="total"
									type="hidden"
									value={String(isCreateDialogOpen?.total || "")}
								/>
								<CurrencyInput
									value={isCreateDialogOpen?.total || 0}
									onChangeValue={(_event, originalValue) =>
										changeCreateDialog("total", originalValue)
									}
									InputElement={<Input placeholder="Ex: 1000" />}
								/>
								<p className="text-destructive text-sm">
									{createState?.errors?.total?.[0]}
								</p>
							</div>
							<div className="grid gap-2">
								<Label>Parcelas</Label>
								<Input
									name="totalParcels"
									value={isCreateDialogOpen?.totalParcels || ""}
									onChange={(event) =>
										changeCreateDialog("totalParcels", event.target.value)
									}
									type="number"
									placeholder="Ex: 1"
								/>
								<p className="text-destructive text-sm">
									{createState?.errors?.totalParcels?.[0]}
								</p>
							</div>
							<div className="grid gap-2">
								<Label>Tipo</Label>
								<Select
									name="type"
									value={isCreateDialogOpen?.type || ""}
									onValueChange={(value) => changeCreateDialog("type", value)}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="EXPENSE">Gasto</SelectItem>
										<SelectItem value="INCOME">Entrada</SelectItem>
									</SelectContent>
								</Select>
								<p className="text-destructive text-sm">
									{createState?.errors?.type?.[0]}
								</p>
							</div>
							<div className="grid gap-2">
								<Label>Data de compra</Label>
								<input
									name="boughtAt"
									type="hidden"
									value={String(isCreateDialogOpen?.boughtAt || "")}
								/>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant={"outline"}
											className={cn(
												"text-left font-normal",
												!isCreateDialogOpen?.boughtAt &&
													"text-muted-foreground",
											)}
										>
											{isCreateDialogOpen?.boughtAt ? (
												formatDate(isCreateDialogOpen.boughtAt)
											) : (
												<span>Escolha uma data</span>
											)}
											<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											mode="single"
											selected={isCreateDialogOpen?.boughtAt}
											onSelect={(value) =>
												changeCreateDialog("boughtAt", value)
											}
										/>
									</PopoverContent>
								</Popover>
								<p className="text-destructive text-sm">
									{createState?.errors?.boughtAt?.[0]}
								</p>
							</div>
							<div className="grid gap-2">
								<Label>Categoria</Label>
								<Select
									name="categoryId"
									value={String(isCreateDialogOpen?.categoryId) || "null"}
									onValueChange={(value) =>
										changeCreateDialog(
											"categoryId",
											value === "null" ? null : Number(value),
										)
									}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="null">Sem categoria</SelectItem>
										{categories.map((category) => (
											<SelectItem
												key={`category-${category.id}`}
												value={String(category.id)}
											>
												{category.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<p className="text-destructive text-sm">
									{createState?.errors?.categoryId?.[0]}
								</p>
							</div>
							<div className="grid gap-2">
								<Label>Conta bancária</Label>
								<Select
									name="bankAccountId"
									value={String(isCreateDialogOpen?.bankAccountId) || "null"}
									onValueChange={(value) =>
										changeCreateDialog(
											"bankAccountId",
											value === "null" ? null : Number(value),
										)
									}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="null">Sem conta bancária</SelectItem>
										{bankAccounts.map((bankAccount) => (
											<SelectItem
												key={`bank-account-${bankAccount.id}`}
												value={String(bankAccount.id)}
											>
												{bankAccount.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<p className="text-destructive text-sm">
									{createState?.errors?.bankAccountId?.[0]}
								</p>
							</div>
							<Button
								type="submit"
								className="w-full"
								disabled={isCreatePending}
							>
								{isCreatePending ? (
									<LoaderCircleIcon className="animate-spin" />
								) : null}
								Criar
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
			<Dialog
				open={isUpdateDialogOpen !== null && isDeleteDialogOpen === null}
				onOpenChange={closeUpdateDialog}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Atualizar Transação</DialogTitle>
						<DialogDescription>
							Atualize as informações da sua transação.
						</DialogDescription>
					</DialogHeader>
					<form action={updateAction}>
						<input
							type="hidden"
							name="id"
							value={String(isUpdateDialogOpen?.id) || ""}
						/>
						<div className="flex flex-col gap-2">
							<div className="grid gap-2">
								<Label>Nome</Label>
								<Input
									name="description"
									value={isUpdateDialogOpen?.description || ""}
									onChange={(event) =>
										changeUpdateDialog("description", event.target.value)
									}
									placeholder="Ex: Comprei uma TV"
								/>
								<p className="text-destructive text-sm">
									{updateState?.errors?.description?.[0]}
								</p>
							</div>
							<div className="grid gap-2">
								<Label>Valor</Label>
								<input
									name="total"
									type="hidden"
									value={String(isUpdateDialogOpen?.total || "")}
								/>
								<CurrencyInput
									value={isUpdateDialogOpen?.total || 0}
									onChangeValue={(_event, originalValue) =>
										changeUpdateDialog("total", originalValue)
									}
									InputElement={<Input placeholder="Ex: 1000" />}
								/>
								<p className="text-destructive text-sm">
									{updateState?.errors?.total?.[0]}
								</p>
							</div>
							<div className="grid gap-2">
								<Label>Parcelas</Label>
								<Input
									name="totalParcels"
									value={isUpdateDialogOpen?.totalParcels || ""}
									onChange={(event) =>
										changeUpdateDialog("totalParcels", event.target.value)
									}
									type="number"
									placeholder="Ex: 1"
								/>
								<p className="text-destructive text-sm">
									{updateState?.errors?.totalParcels?.[0]}
								</p>
							</div>
							<div className="grid gap-2">
								<Label>Tipo</Label>
								<Select
									name="type"
									value={isUpdateDialogOpen?.type || ""}
									onValueChange={(value) => changeUpdateDialog("type", value)}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="EXPENSE">Gasto</SelectItem>
										<SelectItem value="INCOME">Entrada</SelectItem>
									</SelectContent>
								</Select>
								<p className="text-destructive text-sm">
									{updateState?.errors?.type?.[0]}
								</p>
							</div>
							<div className="grid gap-2">
								<Label>Data de compra</Label>
								<input
									name="boughtAt"
									type="hidden"
									value={String(isUpdateDialogOpen?.boughtAt || "")}
								/>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant={"outline"}
											className={cn(
												"text-left font-normal",
												!isUpdateDialogOpen?.boughtAt &&
													"text-muted-foreground",
											)}
										>
											{isUpdateDialogOpen?.boughtAt ? (
												formatDate(isUpdateDialogOpen.boughtAt)
											) : (
												<span>Escolha uma data</span>
											)}
											<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											mode="single"
											selected={isUpdateDialogOpen?.boughtAt}
											onSelect={(value) =>
												changeUpdateDialog("boughtAt", value)
											}
										/>
									</PopoverContent>
								</Popover>
								<p className="text-destructive text-sm">
									{updateState?.errors?.boughtAt?.[0]}
								</p>
							</div>
							<div className="grid gap-2">
								<Label>Categoria</Label>
								<Select
									name="categoryId"
									value={String(isUpdateDialogOpen?.categoryId) || "null"}
									onValueChange={(value) =>
										changeUpdateDialog(
											"categoryId",
											value === "null" ? null : Number(value),
										)
									}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="null">Sem categoria</SelectItem>
										{categories.map((category) => (
											<SelectItem
												key={`category-${category.id}`}
												value={String(category.id)}
											>
												{category.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<p className="text-destructive text-sm">
									{updateState?.errors?.categoryId?.[0]}
								</p>
							</div>
							<div className="grid gap-2">
								<Label>Conta bancária</Label>
								<Select
									name="bankAccountId"
									value={String(isUpdateDialogOpen?.bankAccountId) || "null"}
									onValueChange={(value) =>
										changeUpdateDialog(
											"bankAccountId",
											value === "null" ? null : Number(value),
										)
									}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="null">Sem conta bancária</SelectItem>
										{bankAccounts.map((bankAccount) => (
											<SelectItem
												key={`bank-account-${bankAccount.id}`}
												value={String(bankAccount.id)}
											>
												{bankAccount.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<p className="text-destructive text-sm">
									{updateState?.errors?.bankAccountId?.[0]}
								</p>
							</div>
							<Button
								type="submit"
								className="w-full"
								disabled={isUpdatePending}
							>
								{isUpdatePending ? (
									<LoaderCircleIcon className="animate-spin" />
								) : null}
								Atualizar
							</Button>
						</div>
					</form>
					<Button
						className="w-full !border-destructive text-destructive hover:text-destructive"
						variant="outline"
						type="button"
						onClick={toggleDeleteDialog(isUpdateDialogOpen)}
					>
						Excluir
					</Button>
				</DialogContent>
			</Dialog>
			<Dialog
				open={isDeleteDialogOpen !== null}
				onOpenChange={toggleDeleteDialog()}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Excluir Transação</DialogTitle>
						<DialogDescription>
							Exclua a transação "{isDeleteDialogOpen?.description}" - ID:
							{isDeleteDialogOpen?.id}
						</DialogDescription>
					</DialogHeader>
					<div className="w-full flex gap-4">
						<form className="flex-1" action={deleteAction}>
							<input
								type="hidden"
								name="id"
								value={String(isDeleteDialogOpen?.id) || ""}
							/>
							<Button
								className="w-full !border-destructive text-destructive hover:text-destructive"
								variant="outline"
								type="submit"
								disabled={isDeletePending}
							>
								{isDeletePending ? (
									<LoaderCircleIcon className="animate-spin" />
								) : null}
								Excluir
							</Button>
						</form>
						<Button
							className="flex-1"
							type="button"
							onClick={toggleDeleteDialog()}
						>
							Cancelar
						</Button>
					</div>
				</DialogContent>
			</Dialog>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[100px]">ID</TableHead>
						<TableHead>Descrição</TableHead>
						<TableHead>Categoria</TableHead>
						<TableHead>Conta Bancária</TableHead>
						<TableHead>Valor</TableHead>
						<TableHead>Parcelas</TableHead>
						<TableHead>Data</TableHead>
						<TableHead className="w-[100px]" />
					</TableRow>
				</TableHeader>
				<TableBody>
					{transactions.map((transaction) => (
						<TableRow key={`transaction-${transaction.id}`}>
							<TableCell className="font-medium">{transaction.id}</TableCell>
							<TableCell>{transaction.description}</TableCell>
							<TableCell>
								{categories.find(
									(category) => category.id === transaction.categoryId,
								)?.name || "-"}
							</TableCell>
							<TableCell>
								{bankAccounts.find(
									(bankAccount) => bankAccount.id === transaction.bankAccountId,
								)?.name || "-"}
							</TableCell>
							<TableCell
								className={cn(
									transaction.type === "EXPENSE"
										? "text-red-500"
										: "text-green-500",
								)}
							>
								{formatPrice(Number(transaction.total))}
							</TableCell>
							<TableCell>{transaction.totalParcels}</TableCell>
							<TableCell>
								{formatDate(new Date(transaction.boughtAt))}
							</TableCell>
							<TableCell className="text-right">
								<Button
									size="icon"
									variant="ghost"
									onClick={openUpdateDialog(transaction)}
								>
									<PencilIcon />
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</UserZonePageLayout>
	);
}
