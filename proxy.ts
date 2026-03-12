import { getSessionCookie } from "better-auth/cookies"
import { type NextRequest, NextResponse } from "next/server"

export async function proxy(request: NextRequest) {
    // Optimistic auth check via session cookie.
    // For full SSR protection, use getSession() inside the route/page component.
    const sessionCookie = getSessionCookie(request)
    const pathname = request.nextUrl.pathname

    if (!sessionCookie) {
        // Not authenticated — redirect to sign-in (skip for /onboarding since we check below)
        const redirectTo = pathname + request.nextUrl.search
        return NextResponse.redirect(
            new URL(`/auth/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`, request.url)
        )
    }

    // If the user is already authenticated and tries to visit /onboarding,
    // we read the onboarded flag from the session via an API call.
    // For speed, all other routes just pass through (full data check happens inside the page).
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
                    const dest = user.role === "CONSULTANT" ? "/dashboard" : "/student-dashboard"
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
        "/dashboard/:path*",
        "/user-dashboard/:path*",
        "/student-dashboard/:path*",
        "/sessions/:path*",
        "/student-requests/:path*",
        "/my-requests/:path*",
        "/find-consultants/:path*",
        "/settings/:path*",
        "/onboarding/:path*",
        "/account/:path*",
    ]
}