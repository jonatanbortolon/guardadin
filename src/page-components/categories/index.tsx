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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { UserZonePageLayout } from "@/components/user-zone-page-layout";
import { Category } from "@/kysely/types/category";
import { createCategoryAction } from "@/server-actions/create-category";
import { deleteCategoryAction } from "@/server-actions/delete-category";
import { updateCategoryAction } from "@/server-actions/update-category";
import { LoaderCircleIcon, PencilIcon, PlusIcon } from "lucide-react";
import { useActionState, useEffect, useState } from "react";

type Props = {
	categories: Category[];
};

export default function CategoriesHome({ categories }: Props) {
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<Omit<
		Category,
		"id" | "isDefault" | "createdAt" | "updatedAt" | "userId"
	> | null>(null);
	const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState<Omit<
		Category,
		"createdAt" | "isDefault" | "updatedAt" | "userId"
	> | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<Omit<
		Category,
		"createdAt" | "isDefault" | "updatedAt" | "userId"
	> | null>(null);

	const [createState, createAction, isCreatePending] = useActionState(
		createCategoryAction,
		undefined,
	);
	const [updateState, updateAction, isUpdatePending] = useActionState(
		updateCategoryAction.bind(null, isUpdateDialogOpen?.id),
		undefined,
	);
	const [deleteState, deleteAction, isDeletePending] = useActionState(
		deleteCategoryAction.bind(null, isUpdateDialogOpen?.id),
		undefined,
	);

	function openCreateDialog() {
		setIsCreateDialogOpen({
			name: "",
		});
	}

	function closeCreateDialog() {
		setIsCreateDialogOpen(null);
	}

	function changeCreateDialog(
		field: keyof Omit<
			Category,
			"id" | "isDefault" | "createdAt" | "updatedAt" | "userId"
		>,
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

	function openUpdateDialog(category: Category) {
		return () => {
			const { id, name } = category;

			setIsUpdateDialogOpen({
				id,
				name,
			});
		};
	}

	function closeUpdateDialog() {
		setIsUpdateDialogOpen(null);
	}

	function changeUpdateDialog(
		field: keyof Omit<
			Category,
			"isDefault" | "createdAt" | "updatedAt" | "userId"
		>,
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
		category?: Omit<
			Category,
			"createdAt" | "isDefault" | "updatedAt" | "userId"
		> | null,
	) {
		return () => {
			if (!category) {
				setIsDeleteDialogOpen(null);
				return;
			}

			const { id, name } = category;
			setIsDeleteDialogOpen({
				id,
				name,
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
			title="Categorias"
			description="Liste todas as suas categorias."
			actions={[
				{
					children: (
						<>
							Criar Categoria
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
						<DialogTitle>Criar Categoria</DialogTitle>
						<DialogDescription>
							Crie uma categoria para agrupar seus gastos.
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
									placeholder="Ex: Hobbies"
								/>
								<p className="text-destructive text-sm">
									{createState?.errors?.name?.[0]}
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
						<DialogTitle>Atualizar Categoria</DialogTitle>
						<DialogDescription>
							Atualize as informações da sua categoria.
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
									placeholder="Ex: Hobbies"
								/>
								<p className="text-destructive text-sm">
									{updateState?.errors?.name?.[0]}
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
						<DialogTitle>Excluir Categoria</DialogTitle>
						<DialogDescription>
							Exclua a categoria "{isDeleteDialogOpen?.name}" - ID:
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
						<TableHead className="w-[100px]">ID</TableHead>
						<TableHead>Nome</TableHead>
						<TableHead className="w-[100px]" />
					</TableRow>
				</TableHeader>
				<TableBody>
					{categories.map((category) => (
						<TableRow key={`categories-${category.id}`}>
							<TableCell className="font-medium">{category.id}</TableCell>
							<TableCell>{category.name}</TableCell>
							<TableCell className="text-right">
								{!category.isDefault ? (
									<Button
										size="icon"
										variant="ghost"
										onClick={openUpdateDialog(category)}
									>
										<PencilIcon />
									</Button>
								) : (
									<div className="h-9 w-9" />
								)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</UserZonePageLayout>
	);
}
