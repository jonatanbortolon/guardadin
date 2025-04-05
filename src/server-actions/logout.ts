"use server";
import { session } from "@/libs/session";
import { ResultAsync } from "neverthrow";
import { redirect } from "next/navigation";

export async function logoutAction() {
	const sessionNT = await ResultAsync.fromPromise(session.getSession(), () => ({
		message: "Tivemos um problema no servidor",
	}));

	if (sessionNT.isErr()) {
		return sessionNT.error;
	}

	const { userId } = sessionNT.value;

	if (!userId) {
		return {
			message: "Você precisa estar autenticado",
		};
	}

	const deleteSessionNT = await ResultAsync.fromPromise(
		session.deleteSession(),
		() => ({
			message: "Não foi possível deletar a sessão",
		}),
	);

	if (deleteSessionNT.isErr()) {
		return deleteSessionNT.error;
	}

	redirect("/login");
}
