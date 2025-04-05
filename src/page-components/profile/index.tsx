"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { toast } from "@/components/ui/sonner";
import { UserZonePageLayout } from "@/components/user-zone-page-layout";
import { updateUserAction } from "@/server-actions/update-user";
import { LoaderCircleIcon } from "lucide-react";
import { useActionState, useEffect, useState } from "react";

type Props = {
	name: string;
	phone: string;
};

export default function ProfileHome({ name, phone }: Props) {
	const [updateData, setUpdateData] = useState({
		name,
		phone,
	});

	const [updateState, updateAction, isUpdatePending] = useActionState(
		updateUserAction,
		undefined,
	);

	function changeUpdateData(field: "name" | "phone", value: any) {
		setUpdateData((old) => {
			if (!old) {
				return old;
			}

			const oldHandler = structuredClone(old);
			oldHandler[field] = value as never;
			return oldHandler;
		});
	}

	useEffect(() => {
		if (!updateState?.message) return;

		toast.error(updateState.message);
	}, [updateState]);

	return (
		<UserZonePageLayout
			title="Perfil"
			description="Veja e atualize seus dados pessoais."
		>
			<div className="container flex flex-col">
				<form action={updateAction}>
					<div className="flex flex-col gap-6">
						<div className="grid gap-2">
							<Label>Nome Completo</Label>
							<Input
								name="name"
								disabled
								value={updateData.name}
								onChange={(event) =>
									changeUpdateData("name", event.target.value)
								}
							/>
							<p className="text-destructive text-sm">
								{updateState?.errors?.name?.[0]}
							</p>
						</div>
						<div className="grid gap-2">
							<Label>Numero do WhatsApp</Label>
							<PhoneInput
								name="phone"
								disabled
								international
								value={updateData.phone}
								onChange={(value) => changeUpdateData("phone", value)}
							/>
						</div>
						<Button
							type="submit"
							className="w-full"
							disabled={isUpdatePending || true}
						>
							{isUpdatePending ? (
								<LoaderCircleIcon className="animate-spin" />
							) : null}
							Atualizar perfil
						</Button>
					</div>
				</form>
			</div>
		</UserZonePageLayout>
	);
}
