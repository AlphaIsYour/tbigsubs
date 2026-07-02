import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isAuthRoute = pathname.startsWith("/login");
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/customers") ||
    pathname.startsWith("/sites") ||
    pathname.startsWith("/contractors") ||
    pathname.startsWith("/subscriptions") ||
    pathname.startsWith("/payments") ||
    pathname.startsWith("/notifications") ||
    pathname.startsWith("/audit-logs");

  if (isProtectedRoute && !isLoggedIn) {
    return Response.redirect(new URL("/login", req.url));
  }

  if (isAuthRoute && isLoggedIn) {
    return Response.redirect(new URL("/dashboard", req.url));
  }
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/customers/:path*",
    "/sites/:path*",
    "/contractors/:path*",
    "/subscriptions/:path*",
    "/payments/:path*",
    "/notifications/:path*",
    "/audit-logs/:path*",
    "/login",
  ],
};
