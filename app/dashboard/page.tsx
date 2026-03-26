"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ClipboardList, Users, MessageSquare, CheckCircle, Search, PlusCircle, ArrowUpRight, Clock, Star, TrendingUp, Sparkles } from "lucide-react"
import { trpc } from "@/trpc/client"
import HelperNavbar from "@/components/dashboard/HelperNavbar"
import LoadingDashboard from "@/components/dashboard/LoadingDashboard"
import "./dashboard.css"

export default function DashboardPage() {
    const [showAllRequests, setShowAllRequests] = useState(false)
    const router = useRouter()

    // ── tRPC Data Fetching ───────────────────────────────────────────────────
    const { data: user, isLoading: isLoadingUser } = trpc.users.me.useQuery()
    const { data: requests, isLoading: isLoadingRequests } = trpc.helpRequests.list.useQuery({ helperId: user?.id }, { enabled: !!user?.id })
    const { data: sessions, isLoading: isLoadingSessions } = trpc.sessions.list.useQuery({ helperId: user?.id }, { enabled: !!user?.id })
    const { data: notifications } = trpc.notifications.list.useQuery({ unreadOnly: true })

    const openRequestsCount = requests?.filter((r: any) => r.status === 'PENDING').length || 0
    const completedSessionsCount = sessions?.filter((s: any) => s.status === 'COMPLETED').length || 0
    const unreadNotifCount = notifications?.length || 0

    // ── Role-Based Redirect ──────────────────────────────────────────────────
    useEffect(() => {
        if (!isLoadingUser && user) {
            if (!user.role || user.role === 'STUDENT') {
                router.push("/student-dashboard")
            } else if (user.role === 'ADMIN') {
                router.push("/admin")
            }
        }
    }, [user, isLoadingUser, router])

    if (isLoadingUser || (user && (user.role === 'STUDENT' || user.role === 'ADMIN'))) {
        return <LoadingDashboard />
    }

    const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").toUpperCase()
    const visibleRequests = showAllRequests ? requests : requests?.slice(0, 3)
    const activeSessions = sessions?.filter((s: any) => s.status === 'IN_PROGRESS' || s.status === 'UPCOMING').slice(0, 4) || []

    return (
        <div className="dash-wrapper" style={{ background: 'var(--bg-color)', minHeight: '100vh' }}>
            <HelperNavbar />

            <main className="ch-page-main dash-main" style={{ 
                maxWidth: '1200px', 
                margin: '0 auto', 
                fontFamily: 'var(--font-plus-jakarta-sans), sans-serif'
            }}>
                
                {/* ── Premium Welcome Header ── */}
                <div className="sd-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem', animation: 'fadeInUp 0.5s ease-out' }}>
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
                                Helper Portal
                            </span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </span>
                        </div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em', margin: 0 }}>
                            Howdy{!isLoadingUser && user?.name ? `, ${user.name.split(" ")[0]}` : ''}.
                        </h1>
                    </div>
                    <Link href="/helper-requests" style={{
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
                        View Requests <ArrowUpRight size={18} />
                    </Link>
                </div>

                {/* ── Multi-Tier Onboarding / Profile Alert ── */}
                {user && (
                    <div style={{ animation: 'fadeInDown 0.5s ease-out', marginBottom: '2rem' }}>
                        {/* Case 1: Base Onboarding (General) */}
                        {!user.onboarded && (
                            <div style={{ 
                                background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', 
                                border: '1px solid #fde68a', 
                                padding: '1.5rem', 
                                borderRadius: 'var(--radius-lg)', 
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.1)'
                            }}>
                                <div>
                                    <h3 style={{ margin: 0, color: '#92400e', fontWeight: 800, fontSize: '1rem' }}>Welcome to CampusHelper!</h3>
                                    <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#b45309', fontWeight: 500 }}>Finish your basic onboarding to unlock your full dashboard potential.</p>
                                </div>
                                <Link href="/onboarding" style={{ background: '#f59e0b', color: 'white', padding: '10px 24px', borderRadius: 'var(--radius-pill)', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem', boxShadow: '0 4px 8px rgba(245, 158, 11, 0.2)' }}>
                                    Continue Onboarding
                                </Link>
                            </div>
                        )}

                        {/* Case 2: Verified Helper but Profile Incomplete */}
                        {user.onboarded && user.role === 'HELPER' && !user.helperProfile?.completedProfile && (
                            <div style={{ 
                                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', 
                                border: '1px solid #bae6fd', 
                                padding: '1.75rem', 
                                borderRadius: 'var(--radius-lg)', 
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                boxShadow: '0 10px 20px rgba(14, 165, 233, 0.1)',
                                borderLeft: '6px solid var(--primary)'
                            }}>
                                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Sparkles size={24} />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, color: '#0369a1', fontWeight: 800, fontSize: '1.1rem' }}>Complete Your Professional Profile</h3>
                                        <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#075985', fontWeight: 500, opacity: 0.8 }}>Set your hourly rate, expert headline, and bio to start receiving help requests from students.</p>
                                    </div>
                                </div>
                                <Link href="/dashboard/profile-setup" style={{ 
                                    background: 'var(--primary)', 
                                    color: 'white', 
                                    padding: '12px 28px', 
                                    borderRadius: 'var(--radius-pill)', 
                                    textDecoration: 'none', 
                                    fontWeight: 800, 
                                    fontSize: '0.9rem',
                                    boxShadow: '0 8px 16px color-mix(in srgb, var(--primary) 20%, transparent)'
                                }}>
                                    Complete Profile
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Bento Box Grid Layout ── */}
                <div className="sd-bento-grid" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(12, 1fr)', 
                    gap: '1.5rem',
                    animation: 'fadeInUp 0.6s ease-out'
                }}>
                    
                    {/* Left Column: Stats & Recent Requests */}
                    <div className="sd-span-8" style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        
                        {/* 4-Stat Row */}
                        <div className="sd-stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                            {[
                                { title: "Requests", value: isLoadingRequests ? '-' : requests?.length || 0, icon: ClipboardList, color: '#f59e0b', bg: '#fef3c7' },
                                { title: "Earnings", value: isLoadingUser ? '-' : `₵${user?.helperProfile?.balance?.toFixed(2) || '0.00'}`, icon: TrendingUp, color: '#8b5cf6', bg: '#ede9fe' },
                                { title: "Pending", value: openRequestsCount, icon: Clock, color: '#10b981', bg: '#d1fae5' },
                                { title: "Done", value: completedSessionsCount, icon: CheckCircle, color: '#0ea5e9', bg: '#e0f2fe' }
                            ].map((stat, i) => (
                                <div key={i} className="sd-stat-card" style={{ 
                                    background: 'var(--card-bg)', 
                                    padding: '1.25rem', 
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

                        {/* Recent Requests Card */}
                        <div style={{ 
                            background: 'var(--card-bg)', 
                            borderRadius: 'var(--radius-lg)', 
                            padding: '2rem',
                            boxShadow: 'var(--shadow-md)',
                            border: '1px solid var(--border-color)',
                            flex: 1
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Your Help Requests</h2>
                                <button onClick={() => setShowAllRequests(!showAllRequests)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                                    {showAllRequests ? "Show Less" : "View All →"}
                                </button>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {isLoadingRequests ? <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading...</div> :
                                 visibleRequests?.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--sidebar)', borderRadius: '16px', border: '2px dashed var(--muted)' }}>
                                        <ClipboardList size={40} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>No requests found.</p>
                                    </div>
                                 ) : (
                                    visibleRequests?.map((r: any) => (
                                        <div key={r.id} style={{
                                            padding: '1.25rem',
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
                                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
                                                    {r.student?.name ? getInitials(r.student.name) : "R"}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>{r.title}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{r.course?.name || "General"}</div>
                                                </div>
                                            </div>
                                            <div style={{
                                                background: r.status === 'PENDING' ? '#fef3c7' : '#d1fae5',
                                                color: r.status === 'PENDING' ? '#d97706' : '#059669',
                                                padding: '6px 14px',
                                                borderRadius: 'var(--radius-pill)',
                                                fontSize: '0.75rem',
                                                fontWeight: 800,
                                                textTransform: 'uppercase',
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

                    {/* Right Column: Profile & Scheduled */}
                    <div className="sd-span-4" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        
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
                                                        
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'color-mix(in srgb, var(--card) 20%, transparent)', backdropFilter: 'blur(10px)', border: '2px solid color-mix(in srgb, var(--card) 30%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '2rem', marginBottom: '1rem', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                                {!isLoadingUser && user?.name ? user.name[0].toUpperCase() : '👤'}
                            </div>
                            
                            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '6px' }}>Helper Mode</h3>
                            <p style={{ fontSize: '0.9rem', color: 'color-mix(in srgb, var(--card) 80%, transparent)', fontWeight: 500, lineHeight: 1.5, marginBottom: '1.5rem' }}>
                                Manage your requests and help students achieve their goals.
                            </p>
                            
                            <Link href={user?.role === 'HELPER' && !user.helperProfile?.completedProfile ? "/dashboard/profile-setup" : "/helper-requests"} style={{
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
                                {user?.role === 'HELPER' && !user.helperProfile?.completedProfile ? "Complete Your Profile" : "Browse All Requests"}
                            </Link>
                        </div>

                        {/* Recent Activity / Sessions */}
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
                                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Upcoming Sessions</h2>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {activeSessions.length === 0 ? (
                                    <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>No active sessions.</p>
                                    </div>
                                ) : (
                                    activeSessions.map((s: any) => (
                                        <div key={s.id} style={{
                                            padding: '1rem', background: 'var(--sidebar)', borderRadius: '12px',
                                            borderLeft: '4px solid var(--primary)', display: 'flex', gap: '12px'
                                        }}>
                                            <div style={{ background: 'color-mix(in srgb, var(--primary) 10%, transparent)', color: 'var(--primary)', padding: '8px', borderRadius: '8px', height: 'fit-content' }}>
                                                <TrendingUp size={18} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '2px' }}>
                                                    {s.request?.title || "Help Session"}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '4px' }}>
                                                    with {s.student?.name}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                                    {new Date(s.startTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
