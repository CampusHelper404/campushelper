"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { trpc } from "@/trpc/client"
import { authClient } from "@/lib/auth-client"
import { LogOut } from "lucide-react"

export default function StudentNavbar() {
    const pathname = usePathname()
    const router = useRouter()
    const { data: user, isLoading } = trpc.users.me.useQuery()

    const navLinks = [
        { name: "Dashboard", href: "/student-dashboard" },
        { name: "Find Helpers", href: "/find-helpers" },
        { name: "My Requests", href: "/my-requests" },
        { name: "Become a Helper", href: "/become-helper" },
        { name: "Sessions", href: "/sessions" },
        { name: "Messages", href: "/messages" },
        { name: "Settings", href: "/settings" },
    ]

    const handleSignOut = async () => {
        await authClient.signOut()
        router.push("/auth/sign-in")
    }

    const initials = user?.name
        ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
        : ""

    return (
        <nav style={{
            position: 'sticky',
            top: 0, left: 0, right: 0,
            zIndex: 100,
            background: '#ccdbdc',
            height: '66px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 2.5rem',
            borderBottom: '1px solid rgba(0,50,73,0.08)',
            boxShadow: '0 1px 8px rgba(0,50,73,0.06)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '1200px', margin: '0 auto', gap: '1.5rem' }}>

                {/* Logo */}
                <Link href="/student-dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span style={{ color: '#007ea7', fontWeight: 600, fontSize: '1rem' }}>Campus</span>
                    <span style={{ color: '#003249', fontWeight: 800, fontSize: '1rem' }}>Helper</span>
                    <span style={{ background: 'rgba(0,50,73,0.08)', border: '1px solid rgba(0,50,73,0.12)', padding: '3px 9px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 800, color: '#003249', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Student
                    </span>
                </Link>

                {/* Nav Links */}
                <ul style={{ display: 'flex', gap: '0.15rem', listStyle: 'none', margin: 0, padding: 0, flex: 1, justifyContent: 'center' }}>
                    {navLinks
                        .filter(link => !(link.href === '/become-helper' && user?.role === 'HELPER'))
                        .map(link => {
                            const isActive = pathname === link.href
                            return (
                                <li key={link.href}>
                                    <Link href={link.href} style={{
                                        display: 'block',
                                        textDecoration: 'none',
                                        color: isActive ? '#003249' : '#4a6a7c',
                                        fontWeight: isActive ? 700 : 500,
                                        fontSize: '0.82rem',
                                        padding: '7px 12px',
                                        borderRadius: '8px',
                                        background: isActive ? 'rgba(0,50,73,0.1)' : 'transparent',
                                        transition: 'all 0.15s',
                                    }}>
                                        {link.name}
                                    </Link>
                                </li>
                            )
                        })}
                </ul>

                {/* Right: avatar + sign out */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    {/* Avatar */}
                    <Link href="/settings" style={{ textDecoration: 'none' }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: isLoading ? '#b0cdd0' : '#003249',
                            color: '#9ad1d4',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 800, fontSize: '0.75rem',
                            transition: 'all 0.15s',
                            flexShrink: 0,
                        }}>
                            {isLoading ? '' : initials}
                        </div>
                    </Link>

                    {/* Sign Out */}
                    <button onClick={handleSignOut} style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '7px 13px',
                        borderRadius: '8px',
                        border: '1px solid rgba(0,50,73,0.18)',
                        background: 'transparent',
                        color: '#003249',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        whiteSpace: 'nowrap',
                    }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,50,73,0.08)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                    >
                        <LogOut size={13} /> Sign out
                    </button>
                </div>
            </div>
        </nav>
    )
}
