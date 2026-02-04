import { NextResponse, type NextRequest } from "next/server";

export function authMiddleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("access_token");

  if (pathname.startsWith("/dashboard/super-admin") || pathname.startsWith("/super-admin")) {
    return NextResponse.next();
  }

  if (!accessToken && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/auth/v2/login", req.url));
  }

  if (!accessToken && pathname === "/") {
    return NextResponse.redirect(new URL("/auth/v2/login", req.url));
  }

  if (accessToken && (pathname === "/auth/v2/login" || pathname === "/")) {
    return NextResponse.redirect(new URL("/dashboard/default", req.url));
  }

  return NextResponse.next();
}
