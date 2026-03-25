"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { trpc } from "@/trpc/client"
import { authClient } from "@/lib/auth-client"
import { LayoutDashboard, Users, ShieldCheck, ClipboardList, CalendarDays, LogOut, BookOpen } from "lucide-react"

const navLinks = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Courses", href: "/admin/courses", icon: BookOpen },
    { name: "Verifications", href: "/admin/verifications", icon: ShieldCheck },
    { name: "Requests", href: "/admin/requests", icon: ClipboardList },
    { name: "Sessions", href: "/admin/sessions", icon: CalendarDays },
]


export default function AdminNavbar() {
    const pathname = usePathname()
    const router = useRouter()
    const { data: user } = trpc.users.me.useQuery()

    const handleSignOut = async () => {
        await authClient.signOut()
        router.push("/auth/sign-in")
    }

    return (
        <nav style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            background: 'rgba(0, 50, 73, 0.97)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(0,126,167,0.3)',
            position: 'sticky',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            height: '64px',
        }}>
            {/* Logo */}
            <Link href="/admin" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '3px' }}>
                    <span style={{ color: '#9ad1d4', fontWeight: 500, fontSize: '1rem' }}>Campus</span>
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>Helper</span>
                </div>
                <div style={{
                    background: 'rgba(255,80,80,0.15)',
                    border: '1px solid rgba(255,80,80,0.4)',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    color: '#ff8080',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                }}>
                    Admin
                </div>
            </Link>

            {/* Nav Links */}
            <ul style={{ display: 'flex', gap: '0.25rem', listStyle: 'none', margin: 0, padding: 0 }}>
                {navLinks.map(({ name, href, icon: Icon }) => {
                    const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
                    return (
                        <li key={href}>
                            <Link href={href} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '7px 14px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontSize: '0.82rem',
                                fontWeight: isActive ? 700 : 500,
                                color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                                background: isActive ? 'rgba(0,126,167,0.4)' : 'transparent',
                                transition: 'all 0.15s',
                            }}>
                                <Icon size={14} />
                                {name}
                            </Link>
                        </li>
                    )
                })}
            </ul>

            {/* User + Sign Out */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                    width: '34px', height: '34px',
                    borderRadius: '50%',
                    background: 'rgba(0,126,167,0.5)',
                    color: '#9ad1d4',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '0.75rem',
                }}>
                    {user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "A"}
                </div>
                <button onClick={handleSignOut} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'rgba(255,255,255,0.6)',
                    padding: '7px 12px',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                }}>
                    <LogOut size={13} /> Sign out
                </button>
            </div>
        </nav>
    )
}
