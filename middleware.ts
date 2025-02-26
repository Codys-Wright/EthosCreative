import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth";
import { env } from "@/env";

export async function middleware(request: NextRequest) {
  const cookies = getSessionCookie(request);
  if (!cookies) {
    // Redirect to sign-in page with return URL
    const signInUrl = new URL("/sign-in", env.NEXT_PUBLIC_APP_URL);
    signInUrl.searchParams.set("returnUrl", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/account", "/settings", "/organization/:path*"],
};
