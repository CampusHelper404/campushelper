"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { trpc } from "@/trpc/client"

export default function UserDashboardRedirect() {
    const router = useRouter()
    const { data: user, isLoading } = trpc.users.me.useQuery()

    useEffect(() => {
        if (isLoading) return

        if (!user) {
            router.replace("/auth/sign-in")
            return
        }

        // Not onboarded yet → go to onboarding
        if (!user.onboarded) {
            router.replace("/onboarding")
            return
        }

        // Onboarded → route based on role
        if (user.role === "CONSULTANT") {
            router.replace("/dashboard")
        } else {
            router.replace("/student-dashboard")
        }
    }, [user, isLoading, router])

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid #007ea7', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: '#007ea7', fontWeight: 600 }}>Loading your dashboard...</p>
        </div>
    )
}
