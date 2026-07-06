import { NextResponse } from "next/server";
import { jsonError } from "@/libs/api";
import { requireAdmin } from "@/libs/auth";
import { kysely } from "@/libs/kysely";
import { toPublicUser } from "@/libs/user";
import { updatePhoneSchema } from "@/schemas/auth";

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

	const body = await request.json().catch(() => null);
	const validatedFields = updatePhoneSchema.safeParse(body);

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
		.set({ botAllowed: validatedFields.data.botAllowed })
		.executeTakeFirst();

	if (!updated) {
		return jsonError("Usuário não encontrado", 404);
	}

	return NextResponse.json(toPublicUser(updated));
}
