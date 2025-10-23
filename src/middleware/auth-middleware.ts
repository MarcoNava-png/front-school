import { NextResponse, type NextRequest } from "next/server";

export function authMiddleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("access_token");

  // Proteger rutas del dashboard - requiere autenticación
  if (!accessToken && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/auth/v2/login", req.url));
  }

  // Si está autenticado y va al login o a la raíz, redirigir al dashboard
  if (accessToken && (pathname === "/auth/v2/login" || pathname === "/")) {
    return NextResponse.redirect(new URL("/dashboard/default", req.url));
  }

  return NextResponse.next();
}
