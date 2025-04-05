import { Login } from "@/page-components/login";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "GuardaDin - Entrar",
};

export default async function Page() {
	return <Login />;
}
