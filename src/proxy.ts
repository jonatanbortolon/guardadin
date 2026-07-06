import { type NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "guardadin_session";

export default function proxy(request: NextRequest) {
	if (!request.cookies.has(SESSION_COOKIE)) {
		const url = request.nextUrl.clone();
		url.pathname = "/login";
		return NextResponse.redirect(url);
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/dashboard/:path*",
		"/transactions/:path*",
		"/categories/:path*",
		"/bank-accounts/:path*",
		"/admin/:path*",
		"/profile/:path*",
	],
};
