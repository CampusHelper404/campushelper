"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { trpc } from "@/trpc/client"
import HelperNavbar from "@/components/dashboard/HelperNavbar"
import StudentNavbar from "@/components/dashboard/StudentNavbar"
import { CalendarDays, ExternalLink, Clock, MessageCircle, Calendar, ArrowUpRight, ShieldCheck, ArrowRight, CheckCircle2, BookOpen } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import "../dashboard/dashboard.css"

const STATUS_COLORS: Record<string, { bg: string, color: string }> = {
    UPCOMING: { bg: '#e0f2fe', color: '#0284c7' },
    IN_PROGRESS: { bg: '#d1fae5', color: '#059669' },
    COMPLETED: { bg: '#ccfbf1', color: '#0d9488' },
    CANCELLED: { bg: 'var(--muted)', color: 'var(--muted-foreground)' },
    NO_SHOW: { bg: '#fee2e2', color: '#dc2626' },
    AWAITING_CONFIRMATION: { bg: '#fef3c7', color: '#d97706' },
}

function StatusBadge({ status }: { status: string }) {
    const s = STATUS_COLORS[status] || { bg: 'var(--muted)', color: 'var(--muted-foreground)' }
    return <span style={{ background: s.bg, color: s.color, borderRadius: '20px', padding: '4px 12px', fontSize: '0.72rem', fontWeight: 800, whiteSpace: 'nowrap' }}>{status.replace('_', ' ')}</span>
}

function SessionsContent() {
    const { data: user } = trpc.users.me.useQuery()
    const isHelper = (user as any)?.role === 'HELPER'
    const searchParams = useSearchParams()
    const reference = searchParams.get('reference')
    const [tab, setTab] = useState<'UPCOMING' | 'COMPLETED' | 'ALL'>('UPCOMING')

    const { data: sessions, isLoading, refetch } = trpc.sessions.list.useQuery(
        isHelper ? { helperId: user?.id } : { studentId: user?.id },
        { enabled: !!user?.id }
    )

    const verifyPayment = trpc.payments.verify.useMutation({
        onSuccess: () => {
            toast.success("Payment verified! Your session is now active.")
            refetch()
        },
        onError: (err) => {
            toast.error("Manual verification failed. Please refresh or contact support.")
        }
    })

    const hasVerified = useRef(false)

    useEffect(() => {
        if (reference && !hasVerified.current) {
            hasVerified.current = true
            verifyPayment.mutate({ reference })
        }
    }, [reference])

    const [processingId, setProcessingId] = useState<string | null>(null)

    const initPayment = trpc.payments.initialize.useMutation({
        onSuccess: (data) => {
            window.location.href = data.checkoutUrl
        },
        onError: (err) => {
            toast.error(err.message)
            setProcessingId(null)
        }
    })

    const trackJoin = trpc.sessions.trackJoin.useMutation()

    const completeSession = trpc.sessions.updateStatus.useMutation({
        onSuccess: (data: any) => {
            if (data?.success) {
                toast.success("Session completed and funds released!")
            } else {
                toast.success("Completion requested. Waiting for confirmation.")
            }
            setProcessingId(null)
            refetch()
        },
        onError: (err) => {
            toast.error(err.message)
            setProcessingId(null)
        }
    })

    const handleSecureSession = (sessionId: string) => {
        setProcessingId(sessionId)
        initPayment.mutate({ sessionId })
    }

    const handleComplete = (sessionId: string, status: 'COMPLETED' | 'CANCELLED' = 'COMPLETED', note?: string) => {
        setProcessingId(sessionId)
        completeSession.mutate({ id: sessionId, status, adminNote: note })
    }

    const handleJoin = async (sessionId: string, link: string) => {
        try {
            await trackJoin.mutateAsync({ sessionId })
        } catch (e) {
            console.error("Join tracking failed", e)
        }
        window.open(link, '_blank', 'noreferrer')
    }


    const filtered = sessions?.filter(s => {
        if (tab === 'ALL') return true
        if (tab === 'UPCOMING') return ['UPCOMING', 'IN_PROGRESS', 'AWAITING_CONFIRMATION'].includes(s.status)
        return ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(s.status)
    }) || []

    const Navbar = isHelper ? HelperNavbar : StudentNavbar

    return (
        <div className="dash-wrapper" style={{ background: 'var(--bg-color)', minHeight: '100vh' }}>
            <Navbar />
            <main className="ch-page-main" style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem', fontFamily: 'var(--font-plus-jakarta-sans), sans-serif' }}>

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
                <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', animation: 'fadeInUp 0.6s ease-out', flexWrap: 'wrap' }}>
                    {(['UPCOMING', 'COMPLETED', 'ALL'] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)} style={{ 
                            padding: '10px 24px', 
                            borderRadius: '12px', 
                            border: '1px solid var(--border-color)', 
                            cursor: 'pointer', 
                            fontWeight: 700, 
                            fontSize: '0.85rem', 
                            background: tab === t ? 'var(--header-bg)' : 'var(--card)', 
                            color: tab === t ? 'var(--chart-3)' : 'var(--text-muted)', 
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
                            const isPaid = s.payment?.status === 'HELD' || s.payment?.status === 'RELEASED'
                            
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
                                    transition: 'var(--transition)',
                                    opacity: s.status === 'CANCELLED' ? 0.6 : 1
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)' }}
                                >
                                    {/* Avatar */}
                                    <div style={{ 
                                        width: '64px', height: '64px', borderRadius: '18px', 
                                        background: 'var(--muted)', 
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
                                            {isPaid ? (
                                                <span style={{ background: '#dcfce7', color: '#16a34a', borderRadius: '20px', padding: '4px 12px', fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <ShieldCheck size={12} /> SECURED
                                                </span>
                                            ) : s.status === 'UPCOMING' && !isHelper && (
                                                <span style={{ background: '#fef9c3', color: '#854d0e', borderRadius: '20px', padding: '4px 12px', fontSize: '0.65rem', fontWeight: 800 }}>
                                                    UNPAID
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                            {s.request?.course && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 700, background: 'color-mix(in srgb, var(--primary) 8%, transparent)', padding: '4px 10px', borderRadius: 'var(--radius-pill)' }}>
                                                    <BookOpen size={14} /> {s.request.course.code}
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                                                <Clock size={16} /> {new Date(s.startTime).toLocaleDateString()} · {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        {s.notes && <p style={{ margin: '12px 0 0', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{s.notes}</p>}
                                    </div>
                                    
                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        {/* Student: Secure Session Button */}
                                        {!isHelper && s.status === 'UPCOMING' && !isPaid && (
                                            <button 
                                                onClick={() => handleSecureSession(s.id)}
                                                disabled={processingId === s.id}
                                                style={{ 
                                                    display: 'flex', alignItems: 'center', gap: '8px', 
                                                    padding: '12px 24px', borderRadius: 'var(--radius-pill)', 
                                                    background: 'var(--primary)', color: 'white', 
                                                    fontWeight: 800, fontSize: '0.85rem', border: 'none', 
                                                    cursor: 'pointer', boxShadow: 'var(--shadow-glow)', 
                                                    transition: 'var(--transition)'
                                                }}
                                            >
                                                {processingId === s.id ? 'Loading...' : 'Secure & Pay Now'} <ArrowRight size={18} />
                                            </button>
                                        )}

                                        {/* Student: Awaiting Confirmation Handshake */}
                                        {!isHelper && s.status === 'AWAITING_CONFIRMATION' && (
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button 
                                                    onClick={() => handleComplete(s.id)}
                                                    disabled={processingId === s.id}
                                                    style={{ 
                                                        background: '#10b981', color: 'white', padding: '12px 24px', 
                                                        borderRadius: 'var(--radius-pill)', fontWeight: 800, border: 'none', cursor: 'pointer',
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    Confirm Completion
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        const reason = prompt("Why are you disputing this session?")
                                                        if (reason) handleComplete(s.id, 'CANCELLED', reason)
                                                    }}
                                                    disabled={processingId === s.id}
                                                    style={{ 
                                                        background: '#ef4444', color: 'white', padding: '12px 24px', 
                                                        borderRadius: 'var(--radius-pill)', fontWeight: 800, border: 'none', cursor: 'pointer',
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    Dispute
                                                </button>
                                            </div>
                                        )}

                                        {/* Helper: Handshake Request */}
                                        {isHelper && (s.status === 'UPCOMING' || s.status === 'IN_PROGRESS') && isPaid && (
                                            <button 
                                                onClick={() => handleComplete(s.id)}
                                                disabled={processingId === s.id}
                                                style={{ 
                                                    display: 'flex', alignItems: 'center', gap: '8px', 
                                                    padding: '12px 24px', borderRadius: 'var(--radius-pill)', 
                                                    background: '#10b981', color: 'white', 
                                                    fontWeight: 800, fontSize: '0.85rem', border: 'none', 
                                                    cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.3)', 
                                                    transition: 'var(--transition)'
                                                }}
                                            >
                                                {processingId === s.id ? 'Updating...' : 'Mark as Done'} <CheckCircle2 size={18} />
                                            </button>
                                        )}

                                        <Link href={`/messages?userId=${counterpart?.id}`} style={{ 
                                            display: 'flex', alignItems: 'center', gap: '8px', 
                                            padding: '12px 24px', borderRadius: 'var(--radius-pill)', 
                                            background: '#e0f2fe', color: '#0284c7', 
                                            fontWeight: 800, fontSize: '0.85rem', textDecoration: 'none', 
                                            transition: 'var(--transition)' 
                                        }}>
                                            <MessageCircle size={18} /> Message
                                        </Link>
                                        
                                        {s.meetingLink && (s.status === 'UPCOMING' || s.status === 'IN_PROGRESS' || s.status === 'AWAITING_CONFIRMATION') && (
                                            <button 
                                                onClick={() => handleJoin(s.id, s.meetingLink)}
                                                style={{ 
                                                    display: 'flex', alignItems: 'center', gap: '8px', 
                                                    padding: '12px 24px', borderRadius: 'var(--radius-pill)', 
                                                    background: 'var(--header-bg)', color: 'var(--chart-3)', 
                                                    fontWeight: 800, fontSize: '0.85rem', border: 'none',
                                                    cursor: 'pointer',
                                                    boxShadow: 'var(--shadow-glow)',
                                                    transition: 'var(--transition)'
                                                }}
                                            >
                                                Join <ArrowUpRight size={18} />
                                            </button>
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

export default function SessionsPage() {
    return (
        <Suspense fallback={
            <div className="dash-wrapper" style={{ background: 'var(--bg-color)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontWeight: 800, color: 'var(--text-muted)' }}>Loading sessions dashboard...</div>
            </div>
        }>
            <SessionsContent />
        </Suspense>
    )
}
