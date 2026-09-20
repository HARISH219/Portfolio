import { NextResponse, type NextRequest } from "next/server";
import { verifySessionTokenEdge } from "@/server/auth-edge";

const SESSION_COOKIE = "pcc_session";

/**
 * Protects all /admin routes (except the login page) and the admin API
 * (except the login endpoint). Unauthenticated browser requests are redirected
 * to /admin/login; unauthenticated API requests get a 401.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isLoginPage = pathname === "/admin/login";
  const isLoginApi = pathname === "/api/admin/login";
  const isLogoutApi = pathname === "/api/admin/logout";
  if (isLoginPage || isLoginApi || isLogoutApi) return NextResponse.next();

  const secret = process.env.ADMIN_SESSION_SECRET?.trim() || "dev-only-insecure-secret-change-me";
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionTokenEdge(token, secret);

  if (session) return NextResponse.next();

  // Not authenticated.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
