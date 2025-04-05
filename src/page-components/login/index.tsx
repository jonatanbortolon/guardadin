"use client";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "@/components/ui/sonner";
import { loginAction } from "@/server-actions/login";
import { LoaderCircleIcon } from "lucide-react";
import { useActionState, useEffect } from "react";

export function Login() {
	const [state, action, isPending] = useActionState(loginAction, undefined);

	useEffect(() => {
		if (!state?.message) return;

		toast.error(state.message);
	}, [state]);

	return (
		<div className="w-full h-full px-5 py-5 flex items-center justify-center">
			<Card className="w-full max-w-xl border-border">
				<CardHeader>
					<CardTitle className="text-2xl">Entrar</CardTitle>
					<CardDescription>
						Entre com sua conta para acessar sua conta
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form action={action}>
						<div className="flex flex-col gap-6">
							<div className="grid gap-2">
								<Label>E-mail</Label>
								<Input
									name="email"
									type="email"
									placeholder="email@exemplo.com"
								/>
								<p className="text-destructive text-sm">
									{state?.errors?.email?.[0]}
								</p>
							</div>
							<div className="grid gap-2">
								<Label>Senha</Label>
								<PasswordInput name="password" />
								<p className="text-destructive text-sm">
									{state?.errors?.password?.[0]}
								</p>
							</div>
							<Button className="w-full" type="submit" disabled={isPending}>
								{isPending ? (
									<LoaderCircleIcon className="animate-spin" />
								) : null}
								Login
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
