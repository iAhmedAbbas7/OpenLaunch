// <== IMPORTS ==>
import {
  updateSession,
  getSessionFromRequest,
} from "@/lib/supabase/middleware";
import { authConfig } from "@/config/auth";
import { NextResponse, type NextRequest } from "next/server";

// <== MIDDLEWARE FUNCTION ==>
export async function middleware(request: NextRequest) {
  // GET PATHNAME
  const { pathname } = request.nextUrl;
  // CHECK IF CALLBACK ROUTE - MUST BE PROCESSED BEFORE SESSION UPDATE
  const isCallbackRoute = pathname === authConfig.routes.callback;
  // FOR CALLBACK ROUTE, JUST PASS THROUGH WITHOUT ANY SESSION CHECKS
  if (isCallbackRoute) {
    // RETURN NEXT RESPONSE WITHOUT ANY MODIFICATION
    return NextResponse.next();
  }
  // UPDATE SESSION FOR ALL OTHER ROUTES (REFRESHES AUTH TOKENS)
  const response = await updateSession(request);
  // CHECK IF API ROUTE - ALWAYS ALLOW (API HANDLES ITS OWN AUTH)
  const isApiRoute = pathname.startsWith("/api/");
  // IF API ROUTE, RETURN RESPONSE
  if (isApiRoute) {
    // RETURN RESPONSE
    return response;
  }
  // CHECK IF STATIC ASSET - ALWAYS ALLOW
  const isStaticAsset =
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname.includes(".");
  // IF STATIC ASSET, RETURN RESPONSE
  if (isStaticAsset) {
    // RETURN RESPONSE
    return response;
  }
  // CHECK IF PUBLIC ROUTE
  const isPublicRoute = authConfig.routes.publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  // CHECK IF AUTH ROUTES
  const isAuthRoute = authConfig.routes.authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  // GET SESSION FROM REQUEST
  const user = await getSessionFromRequest(request);
  // CHECK IF USER IS AUTHENTICATED
  const isAuthenticated = !!user;
  // IF AUTH ROUTE, HANDLE SPECIAL CASES
  if (isAuthRoute) {
    // IF AUTHENTICATED, REDIRECT TO DASHBOARD
    if (isAuthenticated) {
      // CREATE REDIRECT URL
      const redirectUrl = new URL(
        authConfig.routes.defaultRedirect,
        request.url
      );
      // RETURN REDIRECT RESPONSE
      return NextResponse.redirect(redirectUrl);
    }
    // IF UNAUTHENTICATED, ALLOW ACCESS TO AUTH PAGES
    return response;
  }
  // IF PUBLIC ROUTE, ALLOW EVERYONE (LOGGED IN OR NOT)
  if (isPublicRoute) {
    // RETURN RESPONSE
    return response;
  }
  // IF PROTECTED ROUTE, REQUIRE AUTHENTICATION
  if (!isAuthenticated) {
    // CREATE SIGN IN URL
    const signInUrl = new URL(authConfig.routes.signIn, request.url);
    // SET NEXT URL
    signInUrl.searchParams.set("next", pathname);
    // RETURN REDIRECT RESPONSE
    return NextResponse.redirect(signInUrl);
  }
  // IF AUTHENTICATED, RETURN RESPONSE
  return response;
}

// <== MIDDLEWARE MATCHER CONFIG ==>
export const config = {
  // MATCHER CONFIG
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
