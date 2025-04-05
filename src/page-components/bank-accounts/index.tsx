"use client";
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
import { createBankAccountAction } from "@/server-actions/create-bank-account";
import { deleteBankAccountAction } from "@/server-actions/delete-bank-account";
import { updateBankAccountAction } from "@/server-actions/update-bank-account";
import { LoaderCircleIcon, PencilIcon, PlusIcon } from "lucide-react";
import { useActionState, useEffect, useState } from "react";

type Props = {
	bankAccounts: BankAccount[];
};

export default function BankAccountsHome({ bankAccounts }: Props) {
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<Omit<
		BankAccount,
		"id" | "createdAt" | "updatedAt" | "userId"
	> | null>(null);
	const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState<Omit<
		BankAccount,
		"createdAt" | "updatedAt" | "userId"
	> | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<Omit<
		BankAccount,
		"createdAt" | "updatedAt" | "userId"
	> | null>(null);

	const [createState, createAction, isCreatePending] = useActionState(
		createBankAccountAction,
		undefined,
	);
	const [updateState, updateAction, isUpdatePending] = useActionState(
		updateBankAccountAction.bind(null, isUpdateDialogOpen?.id),
		undefined,
	);
	const [deleteState, deleteAction, isDeletePending] = useActionState(
		deleteBankAccountAction.bind(null, isUpdateDialogOpen?.id),
		undefined,
	);

	function openCreateDialog() {
		setIsCreateDialogOpen({
			name: "",
			isDefault: false,
		});
	}

	function closeCreateDialog() {
		setIsCreateDialogOpen(null);
	}

	function changeCreateDialog(
		field: keyof Omit<BankAccount, "id" | "createdAt" | "updatedAt" | "userId">,
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

	function openUpdateDialog(bankAccount: BankAccount) {
		return () => {
			const { id, name, isDefault } = bankAccount;

			setIsUpdateDialogOpen({
				id,
				name,
				isDefault,
			});
		};
	}

	function closeUpdateDialog() {
		setIsUpdateDialogOpen(null);
	}

	function changeUpdateDialog(
		field: keyof Omit<BankAccount, "createdAt" | "updatedAt" | "userId">,
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
		bankAccount?: Omit<
			BankAccount,
			"createdAt" | "updatedAt" | "userId"
		> | null,
	) {
		return () => {
			if (!bankAccount) {
				setIsDeleteDialogOpen(null);
				return;
			}

			const { id, name, isDefault } = bankAccount;
			setIsDeleteDialogOpen({
				id,
				name,
				isDefault,
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
			title="Contas Bancárias"
			description="Liste todas as suas contas bancárias."
			actions={[
				{
					children: (
						<>
							Criar Conta Bancária
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
						<DialogTitle>Criar Conta Bancária</DialogTitle>
						<DialogDescription>
							Crie uma conta bancária para receber seus saldos.
						</DialogDescription>
					</DialogHeader>
					<form action={createAction}>
						<div className="flex flex-col gap-2">
							<div className="grid gap-2">
								<Label>Nome</Label>
								<Input
									name="name"
									value={isCreateDialogOpen?.name || ""}
									onChange={(event) =>
										changeCreateDialog("name", event.target.value)
									}
									placeholder="Ex: Nubank"
								/>
								<p className="text-destructive text-sm">
									{createState?.errors?.name?.[0]}
								</p>
							</div>
							<div className="grid gap-2">
								<div className="space-y-2">
									<Label>Conta Padrão?</Label>
									<p className="text-[0.8rem] text-muted-foreground">
										Se esta conta for a sua conta padrão, todos os lançamentos
										serão enviados para esta conta caso não tenha sido
										especificada uma conta.
									</p>
								</div>
								<Switch
									name="isDefault"
									checked={isCreateDialogOpen?.isDefault || false}
									onCheckedChange={(checked) =>
										changeCreateDialog("isDefault", checked)
									}
								/>
								<p className="text-destructive text-sm">
									{createState?.errors?.isDefault?.[0]}
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
						<DialogTitle>Atualizar Conta Bancária</DialogTitle>
						<DialogDescription>
							Atualize as informações da sua conta bancária.
						</DialogDescription>
					</DialogHeader>
					<form action={updateAction}>
						<div className="flex flex-col gap-2">
							<div className="grid gap-2">
								<Label>Nome</Label>
								<Input
									name="name"
									value={isUpdateDialogOpen?.name || ""}
									onChange={(event) =>
										changeUpdateDialog("name", event.target.value)
									}
									placeholder="Ex: Nubank"
								/>
								<p className="text-destructive text-sm">
									{updateState?.errors?.name?.[0]}
								</p>
							</div>
							<div className="grid gap-2">
								<div className="space-y-2">
									<Label>Conta Padrão?</Label>
									<p className="text-[0.8rem] text-muted-foreground">
										Se esta conta for a sua conta padrão, todos os lançamentos
										serão enviados para esta conta caso não tenha sido
										especificada uma conta.
									</p>
								</div>
								<Switch
									name="isDefault"
									checked={isUpdateDialogOpen?.isDefault || false}
									onCheckedChange={(checked) =>
										changeUpdateDialog("isDefault", checked)
									}
								/>
								<p className="text-destructive text-sm">
									{updateState?.errors?.isDefault?.[0]}
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
						className="w-full"
						variant="destructive"
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
						<DialogTitle>Excluir Conta Bancária</DialogTitle>
						<DialogDescription>
							Exclua a conta bancária "{isDeleteDialogOpen?.name}" - ID:
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
								className="w-full"
								type="submit"
								variant="destructive"
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
						<TableHead className="w-[100px]" />
						<TableHead>Nome</TableHead>
						<TableHead className="w-[100px]" />
					</TableRow>
				</TableHeader>
				<TableBody>
					{bankAccounts.map((bankAccount) => (
						<TableRow key={`bank-accounts-${bankAccount.id}`}>
							<TableCell className="font-medium">{bankAccount.id}</TableCell>
							<TableCell>{bankAccount.name}</TableCell>
							<TableCell className="text-right">
								<Button
									size="icon"
									variant="ghost"
									onClick={openUpdateDialog(bankAccount)}
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
