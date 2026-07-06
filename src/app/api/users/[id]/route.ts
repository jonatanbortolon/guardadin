import { NextResponse } from "next/server";
import { jsonError } from "@/libs/api";
import { requireAdmin } from "@/libs/auth";
import { kysely } from "@/libs/kysely";
import { toPublicUser } from "@/libs/user";
import { updateUserSchema } from "@/schemas/auth";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
	const admin = await requireAdmin();

	if (admin instanceof NextResponse) {
		return admin;
	}

	const id = Number((await params).id);

	if (!Number.isFinite(id)) {
		return jsonError("ID do usuário é obrigatório", 400);
	}

	if (id === admin.id) {
		return jsonError("Você não pode alterar sua própria permissão", 400);
	}

	const body = await request.json().catch(() => null);
	const validatedFields = updateUserSchema.safeParse(body);

	if (!validatedFields.success) {
		return NextResponse.json(
			{ errors: validatedFields.error.flatten().fieldErrors },
			{ status: 422 },
		);
	}

	const updated = await kysely
		.updateTable("users")
		.returningAll()
		.where("id", "=", id)
		.where("isAdmin", "=", false)
		.set({ permission: validatedFields.data.permission })
		.executeTakeFirst();

	if (!updated) {
		return jsonError("Usuário não encontrado", 404);
	}

	return NextResponse.json(toPublicUser(updated));
}

export async function DELETE(_request: Request, { params }: Context) {
	const admin = await requireAdmin();

	if (admin instanceof NextResponse) {
		return admin;
	}

	const id = Number((await params).id);

	if (!Number.isFinite(id)) {
		return jsonError("ID do usuário é obrigatório", 400);
	}

	if (id === admin.id) {
		return jsonError("Você não pode remover a si mesmo", 400);
	}

	const deleted = await kysely
		.deleteFrom("users")
		.returningAll()
		.where("id", "=", id)
		.where("isAdmin", "=", false)
		.executeTakeFirst();

	if (!deleted) {
		return jsonError("Usuário não encontrado", 404);
	}

	return NextResponse.json(toPublicUser(deleted));
}
