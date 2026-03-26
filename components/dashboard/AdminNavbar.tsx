"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { trpc } from "@/trpc/client"
import { authClient } from "@/lib/auth-client"
import { LayoutDashboard, Users, ShieldCheck, ClipboardList, CalendarDays, LogOut, BookOpen, Menu, X } from "lucide-react"

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
    const [mobileOpen, setMobileOpen] = useState(false)

    const handleSignOut = async () => {
        await authClient.signOut()
        router.push("/auth/sign-in")
    }

    return (
        <>
            <nav style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 1.5rem',
                background: 'rgba(0, 50, 73, 0.97)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(0,126,167,0.3)',
                position: 'sticky',
                top: 0, left: 0, right: 0,
                zIndex: 100,
                height: '64px',
            }}>
                {/* Logo */}
                <Link href="/admin" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <div style={{ display: 'flex', gap: '3px' }}>
                        <span style={{ color: 'var(--chart-3)', fontWeight: 500, fontSize: '1rem' }}>Campus</span>
                        <span style={{ color: 'var(--card)', fontWeight: 700, fontSize: '1rem' }}>Helper</span>
                    </div>
                    <div style={{
                        background: 'rgba(255,80,80,0.15)',
                        border: '1px solid rgba(255,80,80,0.4)',
                        padding: '3px 10px', borderRadius: '6px',
                        fontSize: '0.65rem', fontWeight: 800, color: '#ff8080',
                        textTransform: 'uppercase', letterSpacing: '0.08em',
                    }}>
                        Admin
                    </div>
                </Link>

                {/* Desktop Nav Links */}
                <ul className="ch-admin-nav-links" style={{ display: 'flex', gap: '0.25rem', listStyle: 'none', margin: 0, padding: 0 }}>
                    {navLinks.map(({ name, href, icon: Icon }) => {
                        const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
                        return (
                            <li key={href}>
                                <Link href={href} style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '7px 14px', borderRadius: '8px',
                                    textDecoration: 'none', fontSize: '0.82rem',
                                    fontWeight: isActive ? 700 : 500,
                                    color: isActive ? 'var(--card)' : 'rgba(255,255,255,0.55)',
                                    background: isActive ? 'rgba(0,126,167,0.4)' : 'transparent',
                                    transition: 'all 0.15s',
                                }}>
                                    <Icon size={14} />{name}
                                </Link>
                            </li>
                        )
                    })}
                </ul>

                {/* User + Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    <div style={{
                        width: '34px', height: '34px', borderRadius: '50%',
                        background: 'rgba(0,126,167,0.5)', color: 'var(--chart-3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '0.75rem',
                    }}>
                        {user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "A"}
                    </div>
                    <button onClick={handleSignOut} className="ch-admin-nav-links" style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        background: 'rgba(255,255,255,0.07)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px', color: 'rgba(255,255,255,0.6)',
                        padding: '7px 12px', cursor: 'pointer',
                        fontSize: '0.78rem', fontWeight: 600,
                    }}>
                        <LogOut size={13} /> Sign out
                    </button>

                    {/* Hamburger */}
                    <button
                        className="ch-admin-hamburger"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        style={{ display: 'none', background: 'transparent', border: 'none', cursor: 'pointer', color: 'white', padding: '4px' }}
                    >
                        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Admin Menu */}
            {mobileOpen && (
                <ul className="ch-admin-nav-links open" style={{
                    position: 'fixed', top: '64px', left: 0, right: 0,
                    background: 'rgba(0, 26, 38, 0.97)', flexDirection: 'column',
                    padding: '1rem', gap: '0.5rem', zIndex: 200,
                    borderBottom: '1px solid rgba(0, 126, 167, 0.3)',
                    display: 'flex', listStyle: 'none', margin: 0,
                }}>
                    {navLinks.map(({ name, href, icon: Icon }) => {
                        const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
                        return (
                            <li key={href}>
                                <Link href={href} onClick={() => setMobileOpen(false)} style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '12px 16px', borderRadius: '10px',
                                    textDecoration: 'none', fontSize: '0.9rem',
                                    fontWeight: isActive ? 700 : 500,
                                    color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
                                    background: isActive ? 'rgba(0,126,167,0.4)' : 'transparent',
                                }}>
                                    <Icon size={16} />{name}
                                </Link>
                            </li>
                        )
                    })}
                    <li style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '8px', paddingTop: '8px' }}>
                        <button onClick={handleSignOut} style={{
                            width: '100%', textAlign: 'left', padding: '12px 16px',
                            borderRadius: '10px', border: 'none', background: 'rgba(255,80,80,0.15)',
                            color: '#ff8080', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px'
                        }}>
                            <LogOut size={16} /> Sign Out
                        </button>
                    </li>
                </ul>
            )}
        </>
    )
}
