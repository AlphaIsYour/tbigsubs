import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthRoute = req.nextUrl.pathname.startsWith("/login");
  const isDashboardRoute =
    req.nextUrl.pathname.startsWith("/dashboard") ||
    req.nextUrl.pathname.startsWith("/customers") ||
    req.nextUrl.pathname.startsWith("/sites") ||
    req.nextUrl.pathname.startsWith("/contractors") ||
    req.nextUrl.pathname.startsWith("/subscriptions") ||
    req.nextUrl.pathname.startsWith("/payments") ||
    req.nextUrl.pathname.startsWith("/audit-logs");

  if (isDashboardRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/customers/:path*",
    "/sites/:path*",
    "/contractors/:path*",
    "/subscriptions/:path*",
    "/payments/:path*",
    "/audit-logs/:path*",
    "/login",
  ],
};
