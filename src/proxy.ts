// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyJWTServer } from "@/lib/auth_JWT/verify_JWT"; // must be edge-safe

// Pages anyone can visit (add /plans so we don't loop)
const PUBLIC_ROUTES = ["/login", "/signup", "/auth/signin", "/plans", "/"];

// URL patterns we never run auth logic for (assets, files, etc.)
const ALWAYS_PUBLIC = [
  /^\/_next\//,
  /^\/favicon\.ico$/,
  /^\/robots\.txt$/,
  /^\/sitemap\.xml$/,
  /^\/public\//,
];

// Prefixes that require auth
const PROTECTED_PREFIXES = [
  "/",
  "/dashboard",
  "/accounts",
  "/profile",
  "/operations",
  "/journal",
  "/podium",
  "/tools",
  "/strategy",
  "/billing",
  "/notifications",
];

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // 1) Skip assets/system routes fast
  if (ALWAYS_PUBLIC.some((re) => re.test(pathname))) {
    return NextResponse.next();
  }

  // 2) Let explicit public pages through
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // 3) Is this path protected?
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) {
    return NextResponse.next();
  }

  // 4) Read token and verify
  // const token = req.cookies.get("accessToken")?.value;
  // if (!token) {
  //   return redirectTo(req, "/auth/signin", pathname + search);
  // }

  // let session: any = null;
  // try {
  //   session = await verifyJWTServer(token); // must work on the edge (use 'jose' under the hood)
  // } catch (err) {
  //   console.warn("JWT validation failed:", err);
  //   return redirectTo(req, "/auth/signin", pathname + search);
  // }
  // if (!session) {
  //   return redirectTo(req, "/auth/signin", pathname + search);
  // }
  // // 5) No valid session -> signin
  // if (!session?.success) {
  //   return redirectTo(req, "/auth/signin", pathname + search);
  // }
  // // 6) Valid session but missing plan -> plans (avoid redirect if already there)
  // const plan = session?.data?.subscriptions ?? null;
  // if (plan === null && pathname !== "/plans") {
  //   return redirectTo(req, "/plans", pathname + search);
  // }

  return NextResponse.next();
}

// Helper: keep return-to so user comes back after completing action
function redirectTo(req: NextRequest, to: string, returnTo?: string) {
  const url = new URL(to, req.url);
  if (returnTo) url.searchParams.set("returnTo", returnTo);
  return NextResponse.redirect(url);
}

// Limit middleware to pages (skip files by default)
export const config = {
  matcher: [
    // run on everything except files with an extension
    "/((?!.*\\.[\\w]+$).*)",
  ],
};
