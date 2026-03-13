"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { trpc } from "@/trpc/client"
import { User } from "lucide-react"

export default function ConsultantNavbar() {
    const pathname = usePathname()
    const { data: user } = trpc.users.me.useQuery()

    const navLinks = [
        { name: "Dashboard", href: "/dashboard" },
        { name: "Student Requests", href: "/student-requests" },
        { name: "Sessions", href: "/sessions" },
        { name: "Messages", href: "/messages" },
        { name: "Settings", href: "/settings" },
    ]

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
    }

    return (
        <nav className="dash-nav" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '0.85rem 2.5rem', 
            background: 'rgba(255,255,255,0.8)', 
            backdropFilter: 'blur(12px)', 
            borderBottom: '1px solid #ccdbdc', 
            position: 'sticky', 
            top: 0, 
            zIndex: 100,
            height: '70px'
        }}>
            <Link href={user?.role === 'STUDENT' ? "/student-dashboard" : "/dashboard"} className="dash-brand" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                    <span style={{ color: '#007ea7', fontWeight: 500 }}>Campus</span>
                    <span style={{ color: '#003249', fontWeight: 700 }}>Helper</span>
                </div>
                <div style={{ 
                    background: 'rgba(0, 126, 167, 0.08)', 
                    padding: '4px 10px', 
                    borderRadius: '6px', 
                    fontSize: '0.7rem', 
                    fontWeight: 700, 
                    color: '#007ea7',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    border: '1px solid rgba(0, 126, 167, 0.2)'
                }}>
                    Consultant Panel
                </div>
            </Link>
            
            <ul className="dash-nav-links" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1.25rem', 
                listStyle: 'none',
                margin: 0,
                padding: 0
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
                                    fontSize: '0.8rem',
                                    padding: '6px 10px',
                                    borderRadius: '8px',
                                    background: isActive ? 'rgba(0, 126, 167, 0.07)' : 'transparent',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {link.name}
                            </Link>
                        </li>
                    )
                })}
            </ul>

            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Link href="/account" style={{ textDecoration: 'none' }}>
                    <div className="dash-avatar" style={{ 
                        width: '34px', 
                        height: '34px', 
                        borderRadius: '50%', 
                        background: '#003249', 
                        color: '#fff', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '0.75rem', 
                        fontWeight: 700 
                    }}>
                        {user?.name ? getInitials(user.name) : "U"}
                    </div>
                </Link>
            </div>
        </nav>
    )
}
