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
        { name: "Messages", href: "/messages" },
        { name: "Apply to Help", href: "/become-consultant" },
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
                <Link href={user?.role === 'CONSULTANT' ? "/dashboard" : "/student-dashboard"} className="logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <span style={{ color: '#007ea7', fontWeight: 700 }}>Campus</span> 
                        <span style={{ color: '#003249', fontWeight: 700 }}>Helper</span>
                    </div>
                    <div style={{ 
                        background: 'rgba(0, 50, 73, 0.05)', 
                        padding: '4px 10px', 
                        borderRadius: '6px', 
                        fontSize: '0.7rem', 
                        fontWeight: 700, 
                        color: '#003249',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        border: '1px solid rgba(0, 50, 73, 0.1)'
                    }}>
                        Student Portal
                    </div>
                </Link>

                {/* Centered Nav Links */}
                <ul className="nav-links" style={{ 
                    display: 'flex', 
                    gap: '1.5rem', 
                    listStyle: 'none', 
                    margin: 0, 
                    padding: 0,
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)'
                }}>
                    {navLinks
                        .filter(link => {
                            if (link.href === '/become-consultant' && user?.role === 'CONSULTANT') return false
                            return true
                        })
                        .map((link) => {
                        const isActive = pathname === link.href
                        return (
                            <li key={link.href}>
                                <Link 
                                    href={link.href} 
                                    style={{ 
                                        textDecoration: 'none', 
                                        color: '#003249', 
                                        fontWeight: isActive ? 700 : 500,
                                        fontSize: '0.88rem',
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
