"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { trpc } from "@/trpc/client"
import { authClient } from "@/lib/auth-client"
import { User } from "lucide-react"

export default function StudentNavbar() {
    const pathname = usePathname()
    const router = useRouter()
    const { data: user } = trpc.users.me.useQuery()

    const navLinks = [
        { name: "Dashboard", href: "/student-dashboard" },
        { name: "Find Consultants", href: "/find-consultants" },
        { name: "My Request", href: "/my-requests" },
        { name: "Settings", href: "/settings" },
    ]

    const handleSignOut = async () => {
        await authClient.signOut()
        router.push("/auth/sign-in")
    }

    return (
        <nav className="navbar dash-navbar scrolled" style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            zIndex: 100, 
            background: '#ccdbdc', 
            height: '70px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 2.5rem',
            borderBottom: '1px solid rgba(0,0,0,0.05)'
        }}>
            <div className="nav-container" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                width: '100%',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                {/* Logo */}
                <Link href="/" className="logo" style={{ textDecoration: 'none', display: 'flex', gap: '4px', fontSize: '1.1rem' }}>
                    <span style={{ color: '#007ea7', fontWeight: 700 }}>Campus</span> 
                    <span style={{ color: '#003249', fontWeight: 700 }}>Helper</span>
                </Link>

                {/* Centered Nav Links */}
                <ul className="nav-links" style={{ 
                    display: 'flex', 
                    gap: '2.5rem', 
                    listStyle: 'none', 
                    margin: 0, 
                    padding: 0,
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)'
                }}>
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href
                        return (
                            <li key={link.href}>
                                <Link 
                                    href={link.href} 
                                    style={{ 
                                        textDecoration: 'none', 
                                        color: '#003249', 
                                        fontWeight: isActive ? 700 : 500,
                                        fontSize: '0.95rem',
                                        paddingBottom: '4px',
                                        borderBottom: isActive ? '2px solid #003249' : 'none'
                                    }}
                                >
                                    {link.name}
                                </Link>
                            </li>
                        )
                    })}
                </ul>

                {/* Profile Avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link 
                        href="/account" 
                        style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            background: '#000',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textDecoration: 'none',
                        }}
                    >
                        <User size={32} />
                    </Link>
                </div>
            </div>
        </nav>
    )
}
