import { NextResponse, type NextRequest } from "next/server"
import { auth } from "@/lib/auth"

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/create", "/edit", "/profile", "/admin"]

// Routes that require admin access
const adminRoutes = ["/admin"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // Get session using BetterAuth
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  // Redirect to auth page if not logged in
  if (!session?.user) {
    const authUrl = new URL("/auth", request.url)
    authUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(authUrl)
  }

  // Check admin access
  if (isAdminRoute) {
    const user = session.user as any
    const role = user.role || "USER"

    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      // Redirect non-admins to dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|form/).*)",
  ],
}
