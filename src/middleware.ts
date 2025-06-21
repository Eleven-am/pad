import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export const config = {
	matcher: ["/dashboard2"], // Specify the routes the middleware applies to
};

export async function middleware(request: NextRequest) {
	const sessionCookie = getSessionCookie(request);
	
	if (!sessionCookie) {
		return NextResponse.redirect(new URL("/", request.url));
	}
	
	return NextResponse.next();
}

