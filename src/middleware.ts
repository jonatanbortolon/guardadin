import { session } from "@/libs/session";
import { NextRequest, NextResponse } from "next/server";

const authRoutes = [
	"/transactions",
	"/categories",
	"/bank-accounts",
	"/profile",
];
const guestRoutes = ["/login"];
const silentRoutes = ["/"];

export default async function middleware(req: NextRequest) {
	const path = req.nextUrl.pathname;
	const isSilentRoute = silentRoutes.includes(path);

	if (isSilentRoute) return NextResponse.next();

	const isAuthRoute = authRoutes.includes(path);
	const isGuestRoute = guestRoutes.includes(path);

	const decryptedSession = await session.getSession();

	const userId = decryptedSession?.userId;

	if (isAuthRoute && !userId) {
		return NextResponse.redirect(new URL("/login", req.nextUrl));
	}

	if (isGuestRoute && userId) {
		return NextResponse.redirect(new URL("/transactions", req.nextUrl));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
