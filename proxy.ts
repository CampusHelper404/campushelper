import { getSessionCookie } from "better-auth/cookies"
import { type NextRequest, NextResponse } from "next/server"

export async function proxy(request: NextRequest) {
    const sessionCookie = getSessionCookie(request)
    const pathname = request.nextUrl.pathname

    // 1. Guest-Only/Public Routes: Landing page and Auth pages
    const isAuthPage = pathname.startsWith("/auth")
    const isLandingPage = pathname === "/"

    if (sessionCookie && (isAuthPage || isLandingPage)) {
        // Logged-in users shouldn't see landing or login/signup screens
        // We fetch the session to determine the correct dashboard
        try {
            const sessionRes = await fetch(new URL("/api/auth/get-session", request.url), {
                headers: { cookie: request.headers.get("cookie") || "" },
            })
            if (sessionRes.ok) {
                const data = await sessionRes.json()
                const user = data?.user
                if (user) {
                    const dest = user.role === "HELPER" ? "/dashboard" : "/student-dashboard"
                    return NextResponse.redirect(new URL(dest, request.url))
                }
            }
        } catch {
            // Fallback to default student dashboard if session fetch fails
            return NextResponse.redirect(new URL("/student-dashboard", request.url))
        }
    }

    if (!sessionCookie) {
        // Not authenticated
        if (isLandingPage || isAuthPage) {
            return NextResponse.next() // Allow landing and auth pages
        }
        
        // Redirect any other protected route to sign-in
        const redirectTo = pathname + request.nextUrl.search
        return NextResponse.redirect(
            new URL(`/auth/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`, request.url)
        )
    }

    // 2. Hybrid/Protected Routes: Access check for logged-in users
    if (pathname.startsWith("/onboarding")) {
        try {
            const sessionRes = await fetch(new URL("/api/auth/get-session", request.url), {
                headers: { cookie: request.headers.get("cookie") || "" },
            })
            if (sessionRes.ok) {
                const data = await sessionRes.json()
                const user = data?.user
                if (user?.onboarded) {
                    // Already onboarded — redirect to appropriate dashboard
                    const dest = user.role === "HELPER" ? "/dashboard" : "/student-dashboard"
                    return NextResponse.redirect(new URL(dest, request.url))
                }
            }
        } catch {
            // If session fetch fails, just let through (fail open for onboarding)
        }
    }

    return NextResponse.next()
}

export const config = {
    // Protected routes — add any new Next.js app routes here
    matcher: [
        "/",
        "/auth/:path*",
        "/dashboard/:path*",
        "/user-dashboard/:path*",
        "/student-dashboard/:path*",
        "/sessions/:path*",
        "/helper-requests/:path*",
        "/my-requests/:path*",
        "/find-helpers/:path*",
        "/settings/:path*",
        "/onboarding/:path*",
        "/account/:path*",
    ]
}