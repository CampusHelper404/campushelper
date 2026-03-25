"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { trpc } from "@/trpc/client"
import HelperNavbar from "@/components/dashboard/HelperNavbar"
import { CheckCircle, XCircle, Inbox, User, BookOpen, MessageCircle, Calendar, Clock } from "lucide-react"
import Link from "next/link"
import "../dashboard/dashboard.css"

type TabType = 'PENDING' | 'ACCEPTED' | 'ALL'

const STATUS_COLORS: Record<string, { bg: string, color: string }> = {
    PENDING: { bg: '#fef3c7', color: '#d97706' },
    ACCEPTED: { bg: '#d1fae5', color: '#059669' },
    DECLINED: { bg: '#fee2e2', color: '#dc2626' },
    CANCELLED: { bg: '#f1f5f9', color: '#64748b' },
    COMPLETED: { bg: '#e0f2fe', color: '#0284c7' },
}

function StatusBadge({ status }: { status: string }) {
    const s = STATUS_COLORS[status] || { bg: '#f1f5f9', color: '#64748b' }
    return <span style={{ background: s.bg, color: s.color, borderRadius: '20px', padding: '4px 12px', fontSize: '0.72rem', fontWeight: 800 }}>{status}</span>
}

export default function HelperRequestsPage() {
    const router = useRouter()
    const [tab, setTab] = useState<TabType>('PENDING')
    const { data: user } = trpc.users.me.useQuery()
    const { data: requests, isLoading, refetch } = trpc.helpRequests.list.useQuery(
        tab !== 'ALL' ? { status: tab as any } : undefined
    )
    const updateStatus = trpc.helpRequests.updateStatus.useMutation({ onSuccess: () => refetch() })

    useEffect(() => {
        if (user && (user as any).role === 'STUDENT') router.push('/student-dashboard')
    }, [user, router])

    return (
        <div className="dash-wrapper" style={{ background: 'var(--bg-color)', minHeight: '100vh' }}>
            <HelperNavbar />
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

                {/* ── Premium Welcome Header ── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', animation: 'fadeInUp 0.5s ease-out' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ 
                                background: 'rgba(0, 50, 73, 0.1)', 
                                color: '#003249', 
                                padding: '4px 12px', 
                                borderRadius: 'var(--radius-pill)', 
                                fontSize: '0.75rem', 
                                fontWeight: 800, 
                                textTransform: 'uppercase', 
                                letterSpacing: '0.05em' 
                            }}>
                                Helper Panel
                            </span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </span>
                        </div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em', margin: 0 }}>
                            Student Requests.
                        </h1>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', animation: 'fadeInUp 0.6s ease-out' }}>
                    {(['PENDING', 'ACCEPTED', 'ALL'] as TabType[]).map(t => (
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
                            transition: 'var(--transition)',
                        }}>{t}</button>
                    ))}
                </div>

                {/* Cards */}
                {isLoading ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>Loading requests...</div>
                ) : requests?.length === 0 ? (
                    <div style={{ background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', padding: '5rem 2rem', textAlign: 'center', border: '2px dashed var(--border-color)', animation: 'fadeInUp 0.7s ease-out' }}>
                        <Inbox size={64} style={{ color: 'var(--border-color)', marginBottom: '1.5rem' }} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 8px' }}>No {tab.toLowerCase()} requests</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500 }}>New requests from students will appear here.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeInUp 0.7s ease-out' }}>
                        {requests?.map((r: any) => (
                            <div key={r.id} style={{
                                background: 'var(--card-bg)',
                                borderRadius: 'var(--radius-lg)',
                                padding: '1.75rem',
                                boxShadow: 'var(--shadow-sm)',
                                border: '1px solid var(--border-color)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '1.5rem',
                                flexWrap: 'wrap',
                                transition: 'var(--transition)'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)' }}
                            >
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <div style={{ 
                                        width: '64px', height: '64px', borderRadius: '18px', 
                                        background: '#f1f5f9', 
                                        color: 'var(--primary)', 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                        fontWeight: 800, fontSize: '1.25rem'
                                    }}>
                                        {r.student?.name?.[0]?.toUpperCase() || 'S'}
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>{r.student?.name}</span>
                                            <StatusBadge status={r.status} />
                                        </div>
                                        <div style={{ marginBottom: '10px', fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>{r.title}</div>
                                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                                                <BookOpen size={16} /> {r.course?.code || "General"}
                                            </div>
                                            {r.preferredDate && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                                                    <Calendar size={16} /> {new Date(r.preferredDate).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    {r.status === 'PENDING' && (
                                        <>
                                            <button 
                                                onClick={() => updateStatus.mutate({ id: r.id, status: 'ACCEPTED' })}
                                                disabled={updateStatus.isPending}
                                                style={{
                                                    background: 'var(--primary)', color: 'white', border: 'none',
                                                    padding: '12px 24px', borderRadius: 'var(--radius-pill)', fontWeight: 800,
                                                    fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                                                    boxShadow: 'var(--shadow-glow)', transition: 'var(--transition)'
                                                }}
                                            >
                                                <CheckCircle size={18} /> Accept
                                            </button>
                                            <button 
                                                onClick={() => updateStatus.mutate({ id: r.id, status: 'DECLINED' })}
                                                disabled={updateStatus.isPending}
                                                style={{
                                                    background: '#fee2e2', color: '#dc2626', border: 'none',
                                                    padding: '12px 24px', borderRadius: 'var(--radius-pill)', fontWeight: 800,
                                                    fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                                                    transition: 'var(--transition)'
                                                }}
                                            >
                                                <XCircle size={18} /> Decline
                                            </button>
                                        </>
                                    )}
                                    {r.status === 'ACCEPTED' && (
                                        <Link href={`/messages?userId=${r.studentId}`} style={{
                                            background: '#e0f2fe', color: '#0284c7', textDecoration: 'none',
                                            padding: '12px 24px', borderRadius: 'var(--radius-pill)', fontWeight: 800,
                                            fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px',
                                            transition: 'var(--transition)'
                                        }}>
                                            <MessageCircle size={18} /> Message
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
