"use client"

import { useState } from "react"
import { trpc } from "@/trpc/client"
import HelperNavbar from "@/components/dashboard/HelperNavbar"
import StudentNavbar from "@/components/dashboard/StudentNavbar"
import { CalendarDays, ExternalLink, Clock, MessageCircle, Calendar, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import "../dashboard/dashboard.css"

const STATUS_COLORS: Record<string, { bg: string, color: string }> = {
    UPCOMING: { bg: '#e0f2fe', color: '#0284c7' },
    IN_PROGRESS: { bg: '#d1fae5', color: '#059669' },
    COMPLETED: { bg: '#ccfbf1', color: '#0d9488' },
    CANCELLED: { bg: '#f1f5f9', color: '#64748b' },
    NO_SHOW: { bg: '#fee2e2', color: '#dc2626' },
}

function StatusBadge({ status }: { status: string }) {
    const s = STATUS_COLORS[status] || { bg: '#f1f5f9', color: '#64748b' }
    return <span style={{ background: s.bg, color: s.color, borderRadius: '20px', padding: '4px 12px', fontSize: '0.72rem', fontWeight: 800, whiteSpace: 'nowrap' }}>{status.replace('_', ' ')}</span>
}

export default function SessionsPage() {
    const { data: user } = trpc.users.me.useQuery()
    const isHelper = (user as any)?.role === 'HELPER'
    const [tab, setTab] = useState<'UPCOMING' | 'COMPLETED' | 'ALL'>('UPCOMING')

    const { data: sessions, isLoading } = trpc.sessions.list.useQuery(
        isHelper ? { helperId: user?.id } : { studentId: user?.id },
        { enabled: !!user?.id }
    )

    const filtered = sessions?.filter(s => {
        if (tab === 'ALL') return true
        if (tab === 'UPCOMING') return ['UPCOMING', 'IN_PROGRESS'].includes(s.status)
        return ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(s.status)
    }) || []

    const Navbar = isHelper ? HelperNavbar : StudentNavbar

    return (
        <div className="dash-wrapper" style={{ background: 'var(--bg-color)', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

                {/* ── Premium Welcome Header ── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', animation: 'fadeInUp 0.5s ease-out' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ 
                                background: 'rgba(0, 126, 167, 0.1)', 
                                color: 'var(--primary)', 
                                padding: '4px 12px', 
                                borderRadius: 'var(--radius-pill)', 
                                fontSize: '0.75rem', 
                                fontWeight: 800, 
                                textTransform: 'uppercase', 
                                letterSpacing: '0.05em' 
                            }}>
                                {isHelper ? 'Helper Portal' : 'Student Hub'}
                            </span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                                Track your learning journey
                            </span>
                        </div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em', margin: 0 }}>
                            Your Sessions.
                        </h1>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', animation: 'fadeInUp 0.6s ease-out' }}>
                    {(['UPCOMING', 'COMPLETED', 'ALL'] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)} style={{ 
                            padding: '10px 24px', 
                            borderRadius: '12px', 
                            border: '1px solid var(--border-color)', 
                            cursor: 'pointer', 
                            fontWeight: 700, 
                            fontSize: '0.85rem', 
                            background: tab === t ? 'var(--header-bg)' : '#fff', 
                            color: tab === t ? '#9ad1d4' : 'var(--text-muted)', 
                            boxShadow: tab === t ? 'var(--shadow-md)' : 'var(--shadow-sm)', 
                            transition: 'var(--transition)' 
                        }}>
                            {t}
                        </button>
                    ))}
                </div>

                {/* Session Cards */}
                {isLoading ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>Loading sessions...</div>
                ) : filtered.length === 0 ? (
                    <div style={{ background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', padding: '5rem 2rem', textAlign: 'center', border: '2px dashed var(--border-color)', animation: 'fadeInUp 0.7s ease-out' }}>
                        <CalendarDays size={64} style={{ color: 'var(--border-color)', marginBottom: '1.5rem' }} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 8px' }}>No {tab.toLowerCase()} sessions found</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500 }}>Your scheduled appointments will appear here.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeInUp 0.7s ease-out' }}>
                        {filtered.map((s: any) => {
                            const counterpart = isHelper ? s.student : s.helper
                            return (
                                <div key={s.id} style={{ 
                                    background: 'var(--card-bg)', 
                                    borderRadius: 'var(--radius-lg)', 
                                    padding: '1.75rem', 
                                    boxShadow: 'var(--shadow-sm)', 
                                    border: '1px solid var(--border-color)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '1.5rem', 
                                    flexWrap: 'wrap',
                                    transition: 'var(--transition)'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)' }}
                                >
                                    {/* Avatar */}
                                    <div style={{ 
                                        width: '64px', height: '64px', borderRadius: '18px', 
                                        background: '#f1f5f9', 
                                        color: 'var(--primary)', 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                        fontWeight: 800, fontSize: '1.25rem',
                                        flexShrink: 0
                                    }}>
                                        {counterpart?.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    
                                    {/* Main Info */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                            <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-main)' }}>{counterpart?.name}</span>
                                            <StatusBadge status={s.status} />
                                        </div>
                                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                            {s.request?.course && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 700, background: 'rgba(0,126,167,0.08)', padding: '4px 10px', borderRadius: 'var(--radius-pill)' }}>
                                                    <Calendar size={14} /> {s.request.course.name}
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                                                <Clock size={16} /> {new Date(s.startTime).toLocaleDateString()} · {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        {s.notes && <p style={{ margin: '12px 0 0', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{s.notes}</p>}
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <Link href={`/messages?userId=${counterpart?.id}`} style={{ 
                                            display: 'flex', alignItems: 'center', gap: '8px', 
                                            padding: '12px 24px', borderRadius: 'var(--radius-pill)', 
                                            background: '#e0f2fe', color: '#0284c7', 
                                            fontWeight: 800, fontSize: '0.85rem', textDecoration: 'none', 
                                            transition: 'var(--transition)' 
                                        }}>
                                            <MessageCircle size={18} /> Message
                                        </Link>
                                        
                                        {s.meetingLink && s.status === 'UPCOMING' && (
                                            <a href={s.meetingLink} target="_blank" rel="noreferrer" style={{ 
                                                display: 'flex', alignItems: 'center', gap: '8px', 
                                                padding: '12px 24px', borderRadius: 'var(--radius-pill)', 
                                                background: 'var(--header-bg)', color: '#9ad1d4', 
                                                fontWeight: 800, fontSize: '0.85rem', textDecoration: 'none', 
                                                boxShadow: 'var(--shadow-glow)',
                                                transition: 'var(--transition)'
                                            }}>
                                                Join Session <ArrowUpRight size={18} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>
        </div>
    )
}
