"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { trpc } from "@/trpc/client"
import AdminNavbar from "@/components/dashboard/AdminNavbar"
import LoadingDashboard from "@/components/dashboard/LoadingDashboard"
import { Users, ShieldCheck, ClipboardList, CalendarDays, TrendingUp, Activity, ArrowUpRight, Clock, Star, Bell } from "lucide-react"
import "../dashboard/dashboard.css"

export default function AdminPage() {
    const router = useRouter()
    const { data: user, isLoading } = trpc.users.me.useQuery()
    const { data: allUsers } = trpc.users.list.useQuery()
    const { data: requests } = trpc.helpRequests.list.useQuery()
    const { data: sessions } = trpc.sessions.list.useQuery()
    const { data: verifications } = trpc.verificationQueue.list.useQuery({ status: 'PENDING' })

    useEffect(() => {
        if (!isLoading && user) {
            if (user.role !== 'ADMIN') {
                router.push('/student-dashboard')
            }
        }
    }, [user, isLoading, router])

    if (isLoading || (user && user.role !== 'ADMIN')) {
        return <LoadingDashboard />
    }

    const helpersCount = allUsers?.filter((u: any) => u.role === 'HELPER').length || 0
    const pendingRequestsCount = requests?.filter((r: any) => r.status === 'PENDING').length || 0
    const pendingVerifsCount = verifications?.length || 0
    
    const recentUsers = allUsers?.slice().sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5) || []

    const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

    return (
        <div className="dash-wrapper" style={{ background: 'var(--bg-color)', minHeight: '100vh' }}>
            <AdminNavbar />

            <main className="ch-page-main" style={{ 
                maxWidth: '1200px', 
                margin: '0 auto', 
                padding: '3rem 1.5rem',
                fontFamily: 'var(--font-plus-jakarta-sans), sans-serif'
            }}>
                
                {/* ── Premium Welcome Header ── */}
                <div className="sd-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', animation: 'fadeInUp 0.5s ease-out', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ 
                                background: 'color-mix(in srgb, var(--primary) 10%, transparent)', 
                                color: 'var(--primary)', 
                                padding: '4px 12px', 
                                borderRadius: 'var(--radius-pill)', 
                                fontSize: '0.75rem', 
                                fontWeight: 800, 
                                textTransform: 'uppercase', 
                                letterSpacing: '0.05em' 
                            }}>
                                Admin Panel
                            </span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </span>
                        </div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em', margin: 0 }}>
                            System Overview.
                        </h1>
                    </div>
                    <Link href="/admin/verifications" style={{
                        background: 'var(--primary)',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: 'var(--radius-pill)',
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: 'var(--shadow-glow)',
                        transition: 'var(--transition)'
                    }} 
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 24px color-mix(in srgb, var(--primary) 25%, transparent)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-glow)' }}
                    >
                        Pending Verifications <ArrowUpRight size={18} />
                    </Link>
                </div>

                {/* ── Bento Box Grid Layout ── */}
                <div className="sd-bento-grid" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)', 
                    gap: '1.5rem',
                    animation: 'fadeInUp 0.6s ease-out'
                }}>
                    
                    {/* Left Column: Stats & Recent Users */}
                    <div className="sd-left-col" style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        
                        {/* 4-Stat Row */}
                        <div className="sd-stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                            {[
                                { title: "Total Users", value: allUsers?.length || 0, icon: Users, color: '#0ea5e9', bg: '#e0f2fe', href: '/admin/users' },
                                { title: "Helpers", value: helpersCount, icon: TrendingUp, color: '#8b5cf6', bg: '#ede9fe', href: '/admin/users' },
                                { title: "Applications", value: pendingVerifsCount, icon: ShieldCheck, color: '#f59e0b', bg: '#fef3c7', href: '/admin/verifications' },
                                { title: "Open Requests", value: pendingRequestsCount, icon: ClipboardList, color: '#10b981', bg: '#d1fae5', href: '/admin/requests' }
                            ].map((stat, i) => (
                                <Link key={i} href={stat.href} style={{ 
                                    textDecoration: 'none',
                                    background: 'var(--card-bg)', 
                                    padding: '1.5rem', 
                                    borderRadius: 'var(--radius-lg)', 
                                    boxShadow: 'var(--shadow-sm)',
                                    border: '1px solid var(--border-color)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    transition: 'var(--transition)'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)' }}
                                >
                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                        <stat.icon size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>{stat.value}</div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '4px' }}>{stat.title}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Recent Users Card */}
                        <div style={{ 
                            background: 'var(--card-bg)', 
                            borderRadius: 'var(--radius-lg)', 
                            padding: '2rem',
                            boxShadow: 'var(--shadow-md)',
                            border: '1px solid var(--border-color)',
                            flex: 1
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Recent Sign-Ups</h2>
                                <Link href="/admin/users" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
                                    View All Users →
                                </Link>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {recentUsers.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--sidebar)', borderRadius: '16px', border: '2px dashed var(--muted)' }}>
                                        <Users size={40} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>No users found.</p>
                                    </div>
                                ) : (
                                    recentUsers.map((u: any) => (
                                        <div key={u.id} style={{
                                            padding: '1rem 1.25rem',
                                            background: 'var(--sidebar)',
                                            borderRadius: '16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            transition: 'var(--transition)',
                                            border: '1px solid transparent'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--card)'; e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)' }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--sidebar)'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = 'none' }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--foreground)', color: 'var(--chart-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
                                                    {getInitials(u.name || "U")}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>{u.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{u.email}</div>
                                                </div>
                                            </div>
                                            <RoleBadge role={u.role} />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Actions & System Status */}
                    <div className="sd-right-col" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        
                        {/* Quick Action Bento Card */}
                        <div style={{
                            background: 'var(--header-bg)',
                            borderRadius: 'var(--radius-lg)',
                            padding: '2.5rem 2rem',
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: 'var(--shadow-lg)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center'
                        }}>
                            <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle, color-mix(in srgb, var(--card) 15%, transparent) 0%, transparent 60%)', animation: 'float 8s infinite linear', pointerEvents: 'none' }} />
                                                        
                            <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'color-mix(in srgb, var(--card) 20%, transparent)', backdropFilter: 'blur(10px)', border: '2px solid color-mix(in srgb, var(--card) 30%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '1.25rem' }}>
                                <ShieldCheck size={32} />
                            </div>
                            
                            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '6px' }}>System Admin</h3>
                            <p style={{ fontSize: '0.9rem', color: 'color-mix(in srgb, var(--card) 80%, transparent)', fontWeight: 500, lineHeight: 1.5, marginBottom: '1.5rem' }}>
                                Manage platform verifications, user roles, and active help requests.
                            </p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                                {[
                                    { label: 'Platform Verifications', href: '/admin/verifications' },
                                    { label: 'User Directory', href: '/admin/users' },
                                    { label: 'Session History', href: '/admin/sessions' }
                                ].map((link, idx) => (
                                    <Link key={idx} href={link.href} style={{
                                        width: '100%',
                                        background: 'color-mix(in srgb, var(--card) 10%, transparent)',
                                        border: '1px solid color-mix(in srgb, var(--card) 20%, transparent)',
                                        color: 'white',
                                        padding: '10px',
                                        borderRadius: 'var(--radius-pill)',
                                        textDecoration: 'none',
                                        fontWeight: 700,
                                        fontSize: '0.85rem',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--primary)' }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'color-mix(in srgb, var(--card) 10%, transparent)'; e.currentTarget.style.color = 'white' }}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Activity Feed Card */}
                        <div style={{ 
                            background: 'var(--card-bg)', 
                            borderRadius: 'var(--radius-lg)', 
                            padding: '2rem',
                            boxShadow: 'var(--shadow-md)',
                            border: '1px solid var(--border-color)',
                            flex: 1
                        }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <Activity size={20} color="var(--primary)" />
                                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>System Health</h2>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {[
                                    { label: 'Database Connection', status: 'Stable', color: '#10b981' },
                                    { label: 'API Endpoints', status: 'Active', color: '#10b981' },
                                    { label: 'Auth Service', status: 'Operational', color: '#10b981' },
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>{item.label}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{item.status}</span>
                                        </div>
                                    </div>
                                ))}
                                
                                <div style={{ 
                                    marginTop: '1rem',
                                    padding: '1.25rem',
                                    background: 'color-mix(in srgb, var(--primary) 5%, transparent)',
                                    borderRadius: '16px',
                                    border: '1px solid color-mix(in srgb, var(--primary) 10%, transparent)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '4px' }}>
                                        <Bell size={16} />
                                        <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>Maintenance</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, lineHeight: 1.4 }}>
                                        No scheduled maintenance for the next 7 days.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    )
}

function RoleBadge({ role }: { role: string }) {
    const map: Record<string, { bg: string, color: string }> = {
        ADMIN: { bg: '#fee2e2', color: '#dc2626' },
        HELPER: { bg: '#d1fae5', color: '#059669' },
        STUDENT: { bg: '#e0f2fe', color: '#0284c7' },
    }
    const s = map[role] || { bg: 'var(--muted)', color: 'var(--muted-foreground)' }
    return (
        <span style={{ background: s.bg, color: s.color, borderRadius: 'var(--radius-pill)', padding: '4px 12px', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.02em' }}>{role}</span>
    )
}
