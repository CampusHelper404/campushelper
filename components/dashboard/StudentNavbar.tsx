"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { trpc } from "@/trpc/client"
import { authClient } from "@/lib/auth-client"
import { LogOut, Menu, X } from "lucide-react"

export default function StudentNavbar() {
    const pathname = usePathname()
    const router = useRouter()
    const { data: user, isLoading } = trpc.users.me.useQuery()
    const [mobileOpen, setMobileOpen] = useState(false)

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

    const filteredLinks = navLinks.filter(link => !(link.href === '/become-helper' && user?.role === 'HELPER'))

    return (
        <>
            <nav style={{
                position: 'sticky',
                top: 0, left: 0, right: 0,
                zIndex: 100,
                background: 'var(--secondary)',
                minHeight: '66px',
                display: 'flex',
                alignItems: 'center',
                padding: '0 1.5rem',
                borderBottom: '1px solid var(--border)',
                boxShadow: '0 1px 8px color-mix(in srgb, var(--foreground) 6%, transparent)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '1200px', margin: '0 auto', gap: '1rem' }}>

                    {/* Logo */}
                    <Link href="/student-dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '1rem' }}>Campus</span>
                        <span style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: '1rem' }}>Helper</span>
                        <span style={{ background: 'color-mix(in srgb, var(--foreground) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--foreground) 12%, transparent)', padding: '3px 9px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 800, color: 'var(--foreground)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Student
                        </span>
                    </Link>

                    {/* Desktop Nav Links */}
                    <ul className="ch-nav-links-desktop" style={{ display: 'flex', gap: '0.15rem', listStyle: 'none', margin: 0, padding: 0, flex: 1, justifyContent: 'center' }}>
                        {filteredLinks.map(link => {
                            const isActive = pathname === link.href
                            return (
                                <li key={link.href}>
                                    <Link href={link.href} style={{
                                        display: 'block',
                                        textDecoration: 'none',
                                        color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
                                        fontWeight: isActive ? 700 : 500,
                                        fontSize: '0.82rem',
                                        padding: '7px 12px',
                                        borderRadius: '8px',
                                        background: isActive ? 'color-mix(in srgb, var(--foreground) 10%, transparent)' : 'transparent',
                                        transition: 'all 0.15s',
                                    }}>
                                        {link.name}
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>

                    {/* Right: theme + avatar + sign out */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                        
                        {/* Avatar */}
                        <Link href="/settings" style={{ textDecoration: 'none' }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                background: isLoading ? 'var(--muted)' : 'var(--foreground)',
                                color: 'var(--chart-3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 800, fontSize: '0.75rem',
                                transition: 'all 0.15s',
                                flexShrink: 0,
                            }}>
                                {isLoading ? '' : initials}
                            </div>
                        </Link>

                        {/* Desktop Only: Sign Out */}
                        <button onClick={handleSignOut} className="ch-nav-links-desktop" style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '7px 13px',
                            borderRadius: '8px',
                            border: '1px solid color-mix(in srgb, var(--foreground) 18%, transparent)',
                            background: 'transparent',
                            color: 'var(--foreground)',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            whiteSpace: 'nowrap',
                        }}>
                            <LogOut size={13} /> Sign out
                        </button>

                        {/* Hamburger button (mobile only) */}
                        <button
                            className="ch-hamburger"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            style={{ display: 'none', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--foreground)', padding: '4px' }}
                        >
                            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="ch-mobile-menu" style={{
                    display: 'none',
                    flexDirection: 'column',
                    position: 'fixed',
                    top: '66px',
                    left: 0,
                    right: 0,
                    background: 'var(--background)',
                    borderBottom: '1px solid var(--border)',
                    padding: '1rem',
                    zIndex: 99,
                    gap: '4px',
                    boxShadow: '0 8px 24px color-mix(in srgb, var(--foreground) 10%, transparent)'
                }}>
                    {filteredLinks.map(link => {
                        const isActive = pathname === link.href
                        return (
                            <Link key={link.href} href={link.href}
                                onClick={() => setMobileOpen(false)}
                                style={{
                                    display: 'block',
                                    padding: '12px 16px',
                                    borderRadius: '10px',
                                    textDecoration: 'none',
                                    fontSize: '0.9rem',
                                    fontWeight: isActive ? 700 : 500,
                                    color: isActive ? 'var(--primary)' : 'var(--foreground)',
                                    background: isActive ? 'color-mix(in srgb, var(--primary) 8%, transparent)' : 'transparent',
                                }}>
                                {link.name}
                            </Link>
                        )
                    })}
                    <div style={{ borderTop: '1px solid var(--border)', marginTop: '8px', paddingTop: '8px' }}>
                        <button onClick={handleSignOut} style={{
                            width: '100%', textAlign: 'left', padding: '12px 16px',
                            borderRadius: '10px', border: 'none', background: '#fee2e2',
                            color: '#dc2626', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px'
                        }}>
                            <LogOut size={16} /> Sign Out
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
