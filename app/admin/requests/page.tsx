"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { trpc } from "@/trpc/client"
import AdminNavbar from "@/components/dashboard/AdminNavbar"
import { Search } from "lucide-react"

const pageStyle: React.CSSProperties = { minHeight: '100vh', background: 'var(--background)', fontFamily: "'Inter', -apple-system, sans-serif" }
const mainStyle: React.CSSProperties = { maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }

const STATUS_COLORS: Record<string, { bg: string, color: string }> = {
    PENDING: { bg: '#fef3c7', color: '#d97706' },
    ACCEPTED: { bg: '#d1fae5', color: '#059669' },
    DECLINED: { bg: '#fee2e2', color: '#dc2626' },
    CANCELLED: { bg: 'var(--muted)', color: 'var(--muted-foreground)' },
    COMPLETED: { bg: '#e0f2fe', color: '#0284c7' },
}

function StatusBadge({ status }: { status: string }) {
    const s = STATUS_COLORS[status] || { bg: 'var(--muted)', color: 'var(--muted-foreground)' }
    return <span style={{ background: s.bg, color: s.color, borderRadius: '20px', padding: '3px 10px', fontSize: '0.7rem', fontWeight: 800 }}>{status}</span>
}

export default function AdminRequestsPage() {
    const router = useRouter()
    const { data: currentUser, isLoading } = trpc.users.me.useQuery()
    const [statusFilter, setStatusFilter] = useState<string>("ALL")
    const [search, setSearch] = useState("")
    const { data: requests, isLoading: rLoading } = trpc.helpRequests.list.useQuery(
        statusFilter !== 'ALL' ? { status: statusFilter as any } : undefined
    )
    const updateStatus = trpc.helpRequests.updateStatus.useMutation()

    useEffect(() => {
        if (!isLoading && currentUser && (currentUser as any).role !== 'ADMIN') router.push('/student-dashboard')
    }, [currentUser, isLoading, router])

    const filtered = requests?.filter((r: any) =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.student?.name?.toLowerCase().includes(search.toLowerCase())
    ) || []

    return (
        <div style={pageStyle}>
            <AdminNavbar />
            <main className="ch-page-main" style={mainStyle}>
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Admin Panel</div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--foreground)', letterSpacing: '-0.03em', margin: 0 }}>Help Requests</h1>
                    <p style={{ color: 'var(--muted-foreground)', marginTop: '6px' }}>Monitor and manage all student help requests.</p>
                </div>

                {/* Filters */}
                <div style={{ background: 'var(--card)', borderRadius: '14px', padding: '1.25rem 1.5rem', marginBottom: '1.25rem', boxShadow: '0 2px 8px color-mix(in srgb, var(--foreground) 6%, transparent)', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: '1 1 250px' }}>
                        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} size={16} />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or student..." style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid var(--muted)', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {['ALL', 'PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED'].map(s => (
                            <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '7px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, background: statusFilter === s ? 'var(--foreground)' : 'var(--muted)', color: statusFilter === s ? 'var(--chart-3)' : 'var(--muted-foreground)' }}>{s}</button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="ch-table-container" style={{ background: 'var(--card)', borderRadius: '16px', boxShadow: '0 2px 8px color-mix(in srgb, var(--foreground) 6%, transparent)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
                        <thead style={{ background: 'var(--sidebar)', borderBottom: '1px solid var(--muted)' }}>
                            <tr>
                                {['Title', 'Student', 'Course', 'Status', 'Date', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '1rem 1.25rem', fontSize: '0.73rem', fontWeight: 800, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rLoading ? (
                                <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Loading...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>No requests found.</td></tr>
                            ) : filtered.map((r: any, i: number) => (
                                <tr key={r.id} style={{ borderBottom: '1px solid var(--muted)', background: i % 2 === 0 ? 'var(--card)' : 'var(--background)' }}>
                                    <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--foreground)', fontSize: '0.87rem', maxWidth: '220px' }}>
                                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</div>
                                        {r.description && <div style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</div>}
                                    </td>
                                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>{r.student?.name || '—'}</td>
                                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.82rem', color: 'var(--muted-foreground)' }}>{r.course?.name || 'General'}</td>
                                    <td style={{ padding: '1rem 1.25rem' }}><StatusBadge status={r.status} /></td>
                                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.82rem', color: 'var(--muted-foreground)' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem 1.25rem' }}>
                                        {r.status === 'PENDING' && (
                                            <button onClick={() => updateStatus.mutate({ id: r.id, status: 'CANCELLED' })} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: '#fee2e2', color: '#dc2626', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>
                                                Cancel
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length > 0 && (
                        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--muted)', fontSize: '0.78rem', color: 'var(--muted-foreground)', fontWeight: 600 }}>
                            Showing {filtered.length} request(s)
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
