import { NextResponse } from "next/server";
import { jsonError } from "@/libs/api";
import { requireWritePermission } from "@/libs/auth";
import { buildInstallments, normalizeParcels } from "@/libs/installments";
import { kysely } from "@/libs/kysely";
import { updateTransactionSchema } from "@/schemas/update-transaction";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
	const auth = await requireWritePermission();
	if (auth instanceof NextResponse) {
		return auth;
	}

	const id = Number((await params).id);

	if (!Number.isFinite(id)) {
		return jsonError("ID do lançamento é obrigatório", 400);
	}

	const body = await request.json().catch(() => null);
	const validatedFields = updateTransactionSchema.safeParse(body);

	if (!validatedFields.success) {
		return NextResponse.json(
			{ errors: validatedFields.error.flatten().fieldErrors },
			{ status: 422 },
		);
	}

	const data = validatedFields.data;
	const totalParcels = normalizeParcels(data.type, data.totalParcels);

	try {
		const updated = await kysely.transaction().execute(async (trx) => {
			const transaction = await trx
				.updateTable("transactions")
				.returningAll()
				.where("id", "=", id)
				.set({
					description: data.description,
					total: data.total,
					totalParcels,
					type: data.type,
					boughtAt: data.boughtAt,
					categoryId: data.categoryId,
					bankAccountId: data.bankAccountId,
				})
				.executeTakeFirst();

			if (!transaction) {
				return null;
			}

			await trx
				.deleteFrom("transaction_payments")
				.where("transactionId", "=", id)
				.execute();

			await trx
				.insertInto("transaction_payments")
				.values(
					buildInstallments({
						total: data.total,
						totalParcels,
						boughtAt: data.boughtAt,
					}).map((installment) => ({
						transactionId: id,
						parcelNumber: installment.parcelNumber,
						amount: installment.amount,
						dueAt: installment.dueAt,
					})),
				)
				.execute();

			return transaction;
		});

		if (!updated) {
			return jsonError("Lançamento não encontrado", 404);
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
		return jsonError("ID do lançamento é obrigatório", 400);
	}

	try {
		const deleted = await kysely
			.deleteFrom("transactions")
			.returningAll()
			.where("id", "=", id)
			.executeTakeFirst();

		if (!deleted) {
			return jsonError("Lançamento não encontrado", 404);
		}

		return NextResponse.json(deleted);
	} catch (error) {
		console.error(error);
		return jsonError("Tivemos um problema no servidor", 500);
	}
}
