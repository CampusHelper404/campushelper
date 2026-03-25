"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { trpc } from "@/trpc/client"
import AdminNavbar from "@/components/dashboard/AdminNavbar"
import { ExternalLink } from "lucide-react"

const pageStyle: React.CSSProperties = { minHeight: '100vh', background: '#f0f4f5', fontFamily: "'Inter', -apple-system, sans-serif", paddingTop: '64px' }
const mainStyle: React.CSSProperties = { maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }

const STATUS_COLORS: Record<string, { bg: string, color: string }> = {
    UPCOMING: { bg: '#e0f2fe', color: '#0284c7' },
    IN_PROGRESS: { bg: '#d1fae5', color: '#059669' },
    COMPLETED: { bg: '#d1fae5', color: '#059669' },
    CANCELLED: { bg: '#f1f5f9', color: '#64748b' },
    NO_SHOW: { bg: '#fee2e2', color: '#dc2626' },
}

function StatusBadge({ status }: { status: string }) {
    const s = STATUS_COLORS[status] || { bg: '#f1f5f9', color: '#64748b' }
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
            <main style={mainStyle}>
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#007ea7', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Admin Panel</div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#003249', letterSpacing: '-0.03em', margin: 0 }}>Sessions</h1>
                    <p style={{ color: '#4a6a7c', marginTop: '6px' }}>View all academic sessions across the platform.</p>
                </div>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                    {['ALL', 'UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '7px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, background: statusFilter === s ? '#003249' : '#fff', color: statusFilter === s ? '#9ad1d4' : '#64748b', boxShadow: statusFilter === s ? 'none' : '0 1px 3px rgba(0,50,73,0.06)' }}>
                            {s.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,50,73,0.06)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                {['Student', 'Helper', 'Course', 'Start Time', 'Status', 'Meeting Link'].map(h => (
                                    <th key={h} style={{ padding: '1rem 1.25rem', fontSize: '0.73rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sLoading ? (
                                <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading...</td></tr>
                            ) : sessions?.length === 0 ? (
                                <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No sessions found.</td></tr>
                            ) : sessions?.map((s: any, i: number) => (
                                <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafcfb' }}>
                                    <td style={{ padding: '1rem 1.25rem' }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.87rem', color: '#003249' }}>{s.student?.name || '—'}</div>
                                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{s.student?.email}</div>
                                    </td>
                                    <td style={{ padding: '1rem 1.25rem' }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.87rem', color: '#003249' }}>{s.helper?.name || '—'}</div>
                                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{s.helper?.email}</div>
                                    </td>
                                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.82rem', color: '#64748b' }}>{s.request?.course?.name || 'General'}</td>
                                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.82rem', color: '#4a6a7c' }}>
                                        {new Date(s.startTime).toLocaleDateString()} <br />
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </td>
                                    <td style={{ padding: '1rem 1.25rem' }}><StatusBadge status={s.status} /></td>
                                    <td style={{ padding: '1rem 1.25rem' }}>
                                        {s.meetingLink ? (
                                            <a href={s.meetingLink} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#007ea7', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none' }}>
                                                Join <ExternalLink size={12} />
                                            </a>
                                        ) : <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>—</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {(sessions?.length ?? 0) > 0 && (
                        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #f1f5f9', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>
                            Showing {sessions?.length} session(s)
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
