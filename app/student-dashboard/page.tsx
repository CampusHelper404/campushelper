"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { trpc } from "@/trpc/client"
import StudentNavbar from "@/components/dashboard/StudentNavbar"
import LoadingDashboard from "@/components/dashboard/LoadingDashboard"
import { MessageSquare, CheckCircle, Search, HelpCircle, User, ArrowUpRight, Clock, Star, TrendingUp, CalendarDays } from "lucide-react"
import "../dashboard/dashboard.css"

export default function StudentDashboardPage() {
    const router = useRouter()
    const { data: user, isLoading: isLoadingUser } = trpc.users.me.useQuery()
    const { data: requests, isLoading: isLoadingRequests } = trpc.helpRequests.list.useQuery({ studentId: user?.id }, { enabled: !!user?.id })
    const { data: sessions, isLoading: isLoadingSessions } = trpc.sessions.list.useQuery({ studentId: user?.id }, { enabled: !!user?.id })
    const { data: notifications } = trpc.notifications.list.useQuery({ unreadOnly: true })
    const { data: helpers, isLoading: isLoadingHelpers } = trpc.helpers.list.useQuery()

    const openRequestsCount = requests?.filter((r: any) => r.status === 'PENDING').length || 0
    const completedSessionsCount = sessions?.filter((s: any) => s.status === 'COMPLETED').length || 0
    const unreadNotifCount = notifications?.length || 0
    const helperCount = helpers?.filter((h: any) => h.verificationStatus === 'APPROVED').length || helpers?.length || 0

    // Role Guard
    useEffect(() => {
        if (!isLoadingUser && user) {
            if (user.role === 'ADMIN') router.push("/admin")
            else if (user.role === 'HELPER') router.push("/dashboard")
        }
    }, [user, isLoadingUser, router])

    if (isLoadingUser || (user && (user.role === 'ADMIN' || user.role === 'HELPER'))) {
        return <LoadingDashboard />
    }

    const recentRequests = requests?.slice(0, 3) || []
    const upcomingSessions = sessions?.filter((s: any) => s.status === 'UPCOMING').slice(0, 3) || []

    return (
        <div className="dash-wrapper" style={{ background: 'var(--bg-color)', minHeight: '100vh' }}>
            <StudentNavbar />

            <main className="ch-page-main" style={{ 
                maxWidth: '1200px', 
                margin: '0 auto', 
                padding: '3rem 1.5rem',
                fontFamily: 'var(--font-plus-jakarta-sans), sans-serif'
            }}>
                
                {/* ── Premium Welcome Header ── */}
                <div className="sd-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', animation: 'fadeInUp 0.5s ease-out', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
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
                                Student Portal
                            </span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </span>
                        </div>
                        <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em', margin: 0 }}>
                            Welcome back{!isLoadingUser && user?.name ? `, ${user.name.split(" ")[0]}` : ''}.
                        </h1>
                    </div>
                    <Link href="/my-requests" style={{
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
                        transition: 'var(--transition)',
                        whiteSpace: 'nowrap'
                    }} 
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
                    >
                        New Request <ArrowUpRight size={18} />
                    </Link>
                </div>

                {/* ── Bento Box Grid Layout ── */}
                <div className="sd-bento-grid" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)', 
                    gap: '1.5rem',
                    animation: 'fadeInUp 0.6s ease-out'
                }}>

                    {/* Left Column: Big Stats & Sessions */}
                    <div className="sd-left-col" style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        
                        {/* 4-Stat Row */}
                        <div className="sd-stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                            {[
                                { title: "Open Requests", value: isLoadingRequests ? '-' : openRequestsCount, icon: HelpCircle, color: '#f59e0b', bg: '#fef3c7' },
                                { title: "New Messages", value: unreadNotifCount, icon: MessageSquare, color: '#8b5cf6', bg: '#ede9fe' },
                                { title: "Active Helpers", value: isLoadingHelpers ? '-' : helperCount, icon: Star, color: '#10b981', bg: '#d1fae5' },
                                { title: "Completed", value: isLoadingSessions ? '-' : completedSessionsCount, icon: CheckCircle, color: '#0ea5e9', bg: '#e0f2fe' }
                            ].map((stat, i) => (
                                <div key={i} style={{ 
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
                                </div>
                            ))}
                        </div>

                        {/* Recent Requests Bento Card */}
                        <div style={{ 
                            background: 'var(--card-bg)', 
                            borderRadius: 'var(--radius-lg)', 
                            padding: '2rem',
                            boxShadow: 'var(--shadow-md)',
                            border: '1px solid var(--border-color)',
                            flex: 1
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Recent Requests</h2>
                                <Link href="/my-requests" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>View All →</Link>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {recentRequests.length === 0 ? (
                                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--sidebar)', borderRadius: '12px' }}>
                                        <HelpCircle size={32} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
                                        <div style={{ fontWeight: 600 }}>No recent requests found</div>
                                        <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>Create one to get help from a peer.</div>
                                    </div>
                                ) : (
                                    recentRequests.map((r: any) => (
                                        <div key={r.id} style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '1.25rem', background: 'var(--sidebar)', borderRadius: '14px',
                                            border: '1px solid rgba(0,0,0,0.03)', transition: 'var(--transition)'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--muted)' }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--sidebar)' }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--header-bg)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem' }}>
                                                    {r.course?.name?.slice(0, 2).toUpperCase() || "GH"}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '2px' }}>{r.title}</div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                                        {new Date(r.createdAt).toLocaleDateString()} • {r.course?.name || "General"}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{
                                                background: r.status === 'PENDING' ? '#fef3c7' : '#d1fae5',
                                                color: r.status === 'PENDING' ? '#d97706' : '#059669',
                                                padding: '6px 14px',
                                                borderRadius: 'var(--radius-pill)',
                                                fontSize: '0.75rem',
                                                fontWeight: 800,
                                                letterSpacing: '0.05em'
                                            }}>
                                                {r.status}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Profile & Upcoming */}
                    <div className="sd-right-col" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        
                        {/* Glassy Hero Widget */}
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
                            
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'color-mix(in srgb, var(--card) 20%, transparent)', backdropFilter: 'blur(10px)', border: '2px solid color-mix(in srgb, var(--card) 30%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '2rem', marginBottom: '1rem', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                                {!isLoadingUser && user?.name ? user.name[0].toUpperCase() : '👤'}
                            </div>
                            
                            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '6px' }}>Ready to learn?</h3>
                            <p style={{ fontSize: '0.9rem', color: 'color-mix(in srgb, var(--card) 80%, transparent)', fontWeight: 500, lineHeight: 1.5, marginBottom: '1.5rem' }}>
                                Find top-rated peer helpers on campus and ace your next exam.
                            </p>
                            
                            <Link href="/find-helpers" style={{
                                width: '100%',
                                background: 'white',
                                color: 'var(--primary)',
                                padding: '12px',
                                borderRadius: 'var(--radius-pill)',
                                textDecoration: 'none',
                                fontWeight: 800,
                                fontSize: '0.9rem',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                            >
                                Browse Helpers
                            </Link>
                        </div>

                        {/* Become a Helper CTA Card */}
                        <div style={{
                            background: '#fef3c7',
                            borderRadius: 'var(--radius-lg)',
                            padding: '2rem',
                            border: '1px solid #fde68a',
                            boxShadow: 'var(--shadow-sm)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            animation: 'fadeInUp 0.8s ease-out'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ background: '#f59e0b', color: 'white', padding: '8px', borderRadius: '10px' }}>
                                    <Star size={20} fill="currentColor" />
                                </div>
                                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#92400e' }}>Earn While Helping</h3>
                            </div>
                            <div style={{ position: 'relative', height: '120px', width: '100%', margin: '0.5rem 0' }}>
                                <Image src="/hero-helper.png" alt="Helper" fill style={{ objectFit: 'contain' }} />
                            </div>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#b45309', fontWeight: 600, lineHeight: 1.5 }}>
                                Are you an expert in a course? Join our helper network and earn extra cash!
                            </p>
                            <Link href="/become-helper" style={{
                                width: '100%',
                                background: '#f59e0b',
                                color: 'white',
                                padding: '10px',
                                borderRadius: 'var(--radius-pill)',
                                textDecoration: 'none',
                                fontWeight: 800,
                                fontSize: '0.85rem',
                                textAlign: 'center',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)'
                            }}>
                                Apply Now
                            </Link>
                        </div>

                        {/* Upcoming Sessions */}
                        <div style={{ 
                            background: 'var(--card-bg)', 
                            borderRadius: 'var(--radius-lg)', 
                            padding: '2rem',
                            boxShadow: 'var(--shadow-md)',
                            border: '1px solid var(--border-color)',
                            flex: 1
                        }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <Clock size={20} color="var(--primary)" />
                                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Upcoming</h2>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {upcomingSessions.length === 0 ? (
                                    <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>No upcoming sessions scheduled.</p>
                                    </div>
                                ) : (
                                    upcomingSessions.map((s: any) => (
                                        <div key={s.id} style={{
                                            padding: '1rem', background: 'var(--sidebar)', borderRadius: '12px',
                                            borderLeft: '4px solid var(--primary)', display: 'flex', gap: '12px'
                                        }}>
                                            <div style={{ background: 'color-mix(in srgb, var(--primary) 10%, transparent)', color: 'var(--primary)', padding: '8px', borderRadius: '8px', height: 'fit-content' }}>
                                                <CalendarDays size={18} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '2px' }}>
                                                    {s.request?.course?.name || "Mentorship"}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '4px' }}>
                                                    With {s.helper?.name}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                                    {new Date(s.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    )
}
