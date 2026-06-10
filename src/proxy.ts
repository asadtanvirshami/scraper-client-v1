import { NextRequest, NextResponse } from "next/server";
import { verifyJWTServer } from "@/lib/auth_JWT/verify_JWT";

const PUBLIC_ROUTES = [
  "/login",
  "/signup",
  "/auth/signin",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/otp",
  "/auth/reset-password",
  "/auth/reset-password/",
  "/plans",
  "/",
];

// USER-role routes that don't require an active subscription
const SUBSCRIPTION_EXEMPT_PREFIXES = ["/plans", "/billings", "/onboarding"];

const ALWAYS_PUBLIC = [
  /^\/_next\//,
  /^\/favicon\.ico$/,
  /^\/robots\.txt$/,
  /^\/sitemap\.xml$/,
  /^\/public\//,
];

// NOTE: including "/" means "everything is protected unless explicitly public"
const PROTECTED_PREFIXES = [
  "/",
  "/dashboard",
  "/settings",
  "/users",
  "/bugs",
  "/campaigns",
  "/billings",
  "/feedbacks",
];

// Admin-only areas
const ADMIN_ONLY_PREFIXES = ["/dashboard/a", "/bugs", "/users", "/feedbacks"];

// User-only dashboard area
const USER_ONLY_PREFIXES = ["/dashboard/u"];

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (ALWAYS_PUBLIC.some((re) => re.test(pathname))) return NextResponse.next();
  if (PUBLIC_ROUTES.includes(pathname)) return NextResponse.next();

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get("access_token")?.value;
  if (!token) return redirectTo(req, "/auth/signin", pathname + search);

  let session: any;
  try {
    session = await verifyJWTServer(token);
  } catch (err) {
    console.warn("JWT validation failed:", err);
    return redirectTo(req, "/auth/signin", pathname + search);
  }

  if (!session?.success) return redirectTo(req, "/auth/signin", pathname + search);

  const roleRaw = session?.data?.role ?? session?.role;
  const role: "ADMIN" | "USER" =
    String(roleRaw || "USER").toUpperCase() === "ADMIN" ? "ADMIN" : "USER";

  const isBlocked = Boolean(session?.data?.is_blocked ?? session?.is_blocked);
  if (isBlocked) return redirectTo(req, "/auth/signin", pathname + search);

  // Check if user has completed onboarding
  const isOnboardingCompleted = Boolean(session?.data?.is_onboarding_completed ?? session?.is_onboarding_completed);
  if (!isOnboardingCompleted && !pathname.startsWith("/onboarding")) {
    return redirectTo(req, "/onboarding", pathname + search);
  }

  // Subscription check – USER role only, skip exempt pages
  if (
    role === "USER" &&
    !SUBSCRIPTION_EXEMPT_PREFIXES.some(
      (p) => pathname === p || pathname.startsWith(p + "/")
    )
  ) {
    const BASE_URL =
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:4000";
    try {
      const subRes = await fetch(`${BASE_URL}/api/billing/subscription`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!subRes.ok) {
        return NextResponse.redirect(new URL("/plans", req.url));
      }
      const subJson = await subRes.json();
      if (!subJson?.data) {
        return NextResponse.redirect(new URL("/plans", req.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/plans", req.url));
    }
  }

  // ✅ IMPORTANT: your routes are /dashboard/a/[id] and /dashboard/u/[id]
  const userId = String(session?.data?.id ?? session?.data?._id ?? "");
  // fallback if id missing (avoid redirect loops)
  if (!userId) return redirectTo(req, "/auth/signin", pathname + search);

  const roleHome =
    role === "ADMIN" ? `/dashboard/a/${userId}` : `/dashboard/u/${userId}`;

  // 1) USER cannot access admin-only prefixes
  if (role === "USER" && isUnderAnyPrefix(pathname, ADMIN_ONLY_PREFIXES)) {
    return NextResponse.redirect(new URL(roleHome, req.url));
  }

  // 2) ADMIN cannot access user dashboard prefix (you requested separation)
  if (role === "ADMIN" && isUnderAnyPrefix(pathname, USER_ONLY_PREFIXES)) {
    return NextResponse.redirect(new URL(roleHome, req.url));
  }

  // ✅ Optional: if user hits /dashboard (root), send to their dashboard home
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return NextResponse.redirect(new URL(roleHome, req.url));
  }

  return NextResponse.next();
}

function isUnderAnyPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function redirectTo(req: NextRequest, to: string, returnTo?: string) {
  const url = new URL(to, req.url);
  if (returnTo) url.searchParams.set("returnTo", returnTo);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!.*\\.[\\w]+$).*)"],
};
