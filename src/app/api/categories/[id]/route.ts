import { NextResponse } from "next/server";
import { jsonError } from "@/libs/api";
import { requireWritePermission } from "@/libs/auth";
import { kysely } from "@/libs/kysely";
import { updateCategorySchema } from "@/schemas/update-category";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
	const auth = await requireWritePermission();
	if (auth instanceof NextResponse) {
		return auth;
	}

	const id = Number((await params).id);

	if (!Number.isFinite(id)) {
		return jsonError("ID da categoria é obrigatória", 400);
	}

	const body = await request.json().catch(() => null);
	const validatedFields = updateCategorySchema.safeParse(body);

	if (!validatedFields.success) {
		return NextResponse.json(
			{ errors: validatedFields.error.flatten().fieldErrors },
			{ status: 422 },
		);
	}

	const { name, isDefault } = validatedFields.data;

	try {
		const updated = await kysely.transaction().execute(async (trx) => {
			if (isDefault) {
				await trx
					.updateTable("categories")
					.set({ isDefault: false })
					.where("isDefault", "=", true)
					.where("id", "!=", id)
					.execute();
			}

			return trx
				.updateTable("categories")
				.returningAll()
				.where("id", "=", id)
				.set({ name, isDefault })
				.executeTakeFirst();
		});

		if (!updated) {
			return jsonError("Categoria não encontrada", 404);
		}

		return NextResponse.json(updated);
	} catch (error) {
		console.error(error);
		return jsonError("Tivemos um problema no servidor", 500);
	}
}

export async function DELETE(_request: Request, { params }: Context) {
	const auth = await requireWritePermission();
	if (auth instanceof NextResponse) {
		return auth;
	}

	const id = Number((await params).id);

	if (!Number.isFinite(id)) {
		return jsonError("ID da categoria é obrigatória", 400);
	}

	try {
		const deleted = await kysely
			.deleteFrom("categories")
			.returningAll()
			.where("id", "=", id)
			.executeTakeFirst();

		if (!deleted) {
			return jsonError("Categoria não encontrada", 404);
		}

		return NextResponse.json(deleted);
	} catch (error) {
		console.error(error);
		return jsonError("Tivemos um problema no servidor", 500);
	}
}
