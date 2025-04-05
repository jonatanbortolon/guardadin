import { kysely } from "@/libs/kysely";
import { session } from "@/libs/session";
import CategoriesHome from "@/page-components/categories";
import { ResultAsync } from "neverthrow";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
	title: "GuardaDin - Categorias",
};

export default async function Page() {
	const userNT = await ResultAsync.fromPromise(
		session.getUserSession(),
		() => ({
			message: "Tivemos um problema no servidor",
		}),
	);

	if (userNT.isErr()) {
		return redirect("/login");
	}

	const user = userNT.value;

	if (!user) {
		return redirect("/login");
	}

	const categoriesNT = await ResultAsync.fromPromise(
		kysely
			.selectFrom("categories")
			.selectAll()
			.where("userId", "=", user.id)
			.execute(),
		() => ({
			message: "Tivemos um problema no servidor",
		}),
	);
	const categories = categoriesNT.isErr() ? [] : categoriesNT.value;

	return <CategoriesHome categories={categories} />;
}
