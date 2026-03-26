"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { trpc } from "@/trpc/client"
import AdminNavbar from "@/components/dashboard/AdminNavbar"
import { ExternalLink } from "lucide-react"

const pageStyle: React.CSSProperties = { minHeight: '100vh', background: 'var(--background)', fontFamily: "'Inter', -apple-system, sans-serif" }
const mainStyle: React.CSSProperties = { maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }

const STATUS_COLORS: Record<string, { bg: string, color: string }> = {
    UPCOMING: { bg: '#e0f2fe', color: '#0284c7' },
    IN_PROGRESS: { bg: '#d1fae5', color: '#059669' },
    COMPLETED: { bg: '#d1fae5', color: '#059669' },
    CANCELLED: { bg: 'var(--muted)', color: 'var(--muted-foreground)' },
    NO_SHOW: { bg: '#fee2e2', color: '#dc2626' },
}

function StatusBadge({ status }: { status: string }) {
    const s = STATUS_COLORS[status] || { bg: 'var(--muted)', color: 'var(--muted-foreground)' }
    return <span style={{ background: s.bg, color: s.color, borderRadius: '20px', padding: '3px 10px', fontSize: '0.7rem', fontWeight: 800 }}>{status.replace('_', ' ')}</span>
}

export default function AdminSessionsPage() {
    const router = useRouter()
    const { data: currentUser, isLoading } = trpc.users.me.useQuery()
    const [statusFilter, setStatusFilter] = useState<string>("ALL")
    const { data: sessions, isLoading: sLoading } = trpc.sessions.list.useQuery(
        statusFilter !== 'ALL' ? { status: statusFilter as any } : undefined
    )

    useEffect(() => {
        if (!isLoading && currentUser && (currentUser as any).role !== 'ADMIN') router.push('/student-dashboard')
    }, [currentUser, isLoading, router])

    return (
        <div style={pageStyle}>
            <AdminNavbar />
            <main className="ch-page-main" style={mainStyle}>
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Admin Panel</div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--foreground)', letterSpacing: '-0.03em', margin: 0 }}>Sessions</h1>
                    <p style={{ color: 'var(--muted-foreground)', marginTop: '6px' }}>View all academic sessions across the platform.</p>
                </div>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                    {['ALL', 'UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '7px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, background: statusFilter === s ? 'var(--foreground)' : 'var(--card)', color: statusFilter === s ? 'var(--chart-3)' : 'var(--muted-foreground)', boxShadow: statusFilter === s ? 'none' : '0 1px 3px color-mix(in srgb, var(--foreground) 6%, transparent)' }}>
                            {s.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="ch-table-container" style={{ background: 'var(--card)', borderRadius: '16px', boxShadow: '0 2px 8px color-mix(in srgb, var(--foreground) 6%, transparent)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
                        <thead style={{ background: 'var(--sidebar)', borderBottom: '1px solid var(--muted)' }}>
                            <tr>
                                {['Student', 'Helper', 'Course', 'Start Time', 'Status', 'Meeting Link'].map(h => (
                                    <th key={h} style={{ padding: '1rem 1.25rem', fontSize: '0.73rem', fontWeight: 800, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sLoading ? (
                                <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Loading...</td></tr>
                            ) : sessions?.length === 0 ? (
                                <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>No sessions found.</td></tr>
                            ) : sessions?.map((s: any, i: number) => (
                                <tr key={s.id} style={{ borderBottom: '1px solid var(--muted)', background: i % 2 === 0 ? 'var(--card)' : 'var(--background)' }}>
                                    <td style={{ padding: '1rem 1.25rem' }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.87rem', color: 'var(--foreground)' }}>{s.student?.name || '—'}</div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)' }}>{s.student?.email}</div>
                                    </td>
                                    <td style={{ padding: '1rem 1.25rem' }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.87rem', color: 'var(--foreground)' }}>{s.helper?.name || '—'}</div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)' }}>{s.helper?.email}</div>
                                    </td>
                                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.82rem', color: 'var(--muted-foreground)' }}>{s.request?.course?.name || 'General'}</td>
                                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.82rem', color: 'var(--muted-foreground)' }}>
                                        {new Date(s.startTime).toLocaleDateString()} <br />
                                        <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </td>
                                    <td style={{ padding: '1rem 1.25rem' }}><StatusBadge status={s.status} /></td>
                                    <td style={{ padding: '1rem 1.25rem' }}>
                                        {s.meetingLink ? (
                                            <a href={s.meetingLink} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none' }}>
                                                Join <ExternalLink size={12} />
                                            </a>
                                        ) : <span style={{ color: 'var(--muted-foreground)', fontSize: '0.8rem' }}>—</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {(sessions?.length ?? 0) > 0 && (
                        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--muted)', fontSize: '0.78rem', color: 'var(--muted-foreground)', fontWeight: 600 }}>
                            Showing {sessions?.length} session(s)
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
