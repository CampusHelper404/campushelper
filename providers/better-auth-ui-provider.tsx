"use client"

import { AuthUIProvider } from "@daveyplate/better-auth-ui"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"

import { authClient } from "@/lib/auth-client"

function ThemeAutoSwitcher({ children }: { children: ReactNode }) {
    const { data: session } = authClient.useSession()
    const { setTheme, theme } = useTheme()
    const previousSession = useRef(session)

    useEffect(() => {
        // Only trigger when transitioning from NO session to a REAL session
        // AND theme is currently "system" (meaning user hasn't overridden it yet)
        if (!previousSession.current && session && theme === 'system') {
            setTheme('dark')
        }
        previousSession.current = session
    }, [session, theme, setTheme])

    return <>{children}</>
}

export default function BetterAuthUIProvider({ children }: { children: ReactNode }) {
    const router = useRouter()

    return (
        <AuthUIProvider
            authClient={authClient}
            navigate={router.push}
           social={{
            providers: ["github", "google"]
          }}
            replace={router.replace}
            onSessionChange={() => {
                // Clear router cache (protected routes)
                router.refresh()
            }}
            Link={Link}
        >
            <ThemeAutoSwitcher>{children}</ThemeAutoSwitcher>
        </AuthUIProvider>
    )
}