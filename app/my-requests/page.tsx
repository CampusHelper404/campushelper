"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { trpc } from "@/trpc/client"
import StudentNavbar from "@/components/dashboard/StudentNavbar"
import HelperNavbar from "@/components/dashboard/HelperNavbar"
import { PlusCircle, ClipboardList, X, Check, AlertCircle } from "lucide-react"
import Link from "next/link"
import "../dashboard/dashboard.css"

const STATUS_COLORS: Record<string, { bg: string, color: string, label: string }> = {
    PENDING: { bg: '#fef3c7', color: '#d97706', label: 'Pending' },
    ACCEPTED: { bg: '#d1fae5', color: '#059669', label: 'Accepted' },
    DECLINED: { bg: '#fee2e2', color: '#dc2626', label: 'Declined' },
    CANCELLED: { bg: 'var(--muted)', color: 'var(--muted-foreground)', label: 'Cancelled' },
    COMPLETED: { bg: '#e0f2fe', color: '#0284c7', label: 'Completed' },
}

function StatusBadge({ status }: { status: string }) {
    const s = STATUS_COLORS[status] || { bg: 'var(--muted)', color: 'var(--muted-foreground)', label: status }
    return <span style={{ background: s.bg, color: s.color, borderRadius: '20px', padding: '4px 12px', fontSize: '0.72rem', fontWeight: 800 }}>{s.label}</span>
}

export default function MyRequestsPage() {
    const router = useRouter()
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState({ title: '', description: '', courseId: '', preferredDate: '', preferredTime: '' })
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success'>('idle')

    const { data: user } = trpc.users.me.useQuery()
    const { data: requests, isLoading, refetch } = trpc.helpRequests.list.useQuery({ studentId: user?.id }, { enabled: !!user?.id })
    const { data: courses } = trpc.courses.list.useQuery()
    const createRequest = trpc.helpRequests.create.useMutation({
        onSuccess: () => { setSubmitStatus('success'); refetch(); setTimeout(() => { setShowModal(false); setSubmitStatus('idle'); setForm({ title: '', description: '', courseId: '', preferredDate: '', preferredTime: '' }) }, 1200) }
    })
    const updateStatus = trpc.helpRequests.updateStatus.useMutation({ onSuccess: () => refetch() })

    useEffect(() => {
        if (user && (user as any).role === 'HELPER') router.push('/dashboard')
    }, [user, router])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.title.trim()) return
        setSubmitStatus('loading')
        createRequest.mutate({
            title: form.title,
            description: form.description || undefined,
            courseId: form.courseId || undefined,
            preferredDate: form.preferredDate ? new Date(form.preferredDate) : undefined,
            preferredTime: form.preferredTime || undefined,
        })
    }

    return (
        <div className="dash-wrapper" style={{ background: 'var(--background)', minHeight: '100vh' }}>
            <StudentNavbar />
            <main className="ch-page-main" style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>

                {/* Banner */}
                <section style={{
                    background: 'linear-gradient(135deg, var(--chart-3) 0%, #7bbfc3 100%)',
                    borderRadius: '20px',
                    padding: '2.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem',
                    boxShadow: '0 8px 24px color-mix(in srgb, var(--primary) 20%, transparent)',
                }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Student Dashboard</div>
                        <h1 style={{ fontSize: '1.9rem', fontWeight: 900, color: 'var(--foreground)', margin: '0 0 10px', letterSpacing: '-0.03em' }}>My Help Requests</h1>
                        <p style={{ color: '#005269', fontSize: '1rem', margin: '0 0 1.5rem' }}>Track your active, accepted, and completed requests.</p>
                        <button onClick={() => setShowModal(true)} style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: 'var(--foreground)', color: 'var(--chart-3)',
                            border: 'none', padding: '12px 24px', borderRadius: '12px',
                            fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
                            boxShadow: '0 6px 16px color-mix(in srgb, var(--foreground) 30%, transparent)',
                            transition: 'all 0.15s'
                        }}>
                            <PlusCircle size={17} /> New Request
                        </button>
                    </div>
                    <ClipboardList size={120} className="ch-banner-icon" style={{ opacity: 0.15, flexShrink: 0 }} color="var(--foreground)" />
                </section>

                {/* Requests Table */}
                <section className="ch-table-container" style={{ background: 'var(--card)', borderRadius: '20px', boxShadow: '0 2px 12px color-mix(in srgb, var(--foreground) 7%, transparent)', overflowX: 'auto' }}>
                    <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid var(--muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--foreground)', margin: 0 }}>Your Requests</h2>
                        <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', fontWeight: 600 }}>{requests?.length ?? 0} total</span>
                    </div>
                    <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: 'var(--sidebar)' }}>
                            <tr>
                                {['Subject / Course', 'Status', 'Assigned Helper', 'Date', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '0.9rem 1.5rem', fontSize: '0.72rem', fontWeight: 800, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Loading your requests...</td></tr>
                            ) : requests?.length === 0 ? (
                                <tr><td colSpan={5} style={{ padding: '4rem', textAlign: 'center' }}>
                                    <ClipboardList size={48} style={{ opacity: 0.1, marginBottom: '1rem', display: 'block', margin: '0 auto 1rem' }} />
                                    <p style={{ color: 'var(--muted-foreground)', marginBottom: '1rem' }}>You haven&apos;t posted any requests yet.</p>
                                    <button onClick={() => setShowModal(true)} style={{ background: 'var(--primary)', color: 'var(--card)', border: 'none', padding: '10px 24px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>Post Your First Request</button>
                                </td></tr>
                            ) : requests?.map((r: any, i: number) => (
                                <tr key={r.id} style={{ borderBottom: '1px solid var(--sidebar)', background: i % 2 === 0 ? 'var(--card)' : '#fdfefe' }}>
                                    <td style={{ padding: '1.1rem 1.5rem' }}>
                                        <div style={{ fontWeight: 700, color: 'var(--foreground)', fontSize: '0.88rem' }}>{r.title}</div>
                                        {r.course && <div style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)', marginTop: '2px' }}>{r.course.name}</div>}
                                    </td>
                                    <td style={{ padding: '1.1rem 1.5rem' }}><StatusBadge status={r.status} /></td>
                                    <td style={{ padding: '1.1rem 1.5rem' }}>
                                        {r.acceptedBy ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--secondary)', color: 'var(--foreground)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.72rem' }}>
                                                    {r.acceptedBy.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                                                </div>
                                                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--foreground)' }}>{r.acceptedBy.name}</span>
                                            </div>
                                        ) : <span style={{ color: 'var(--muted-foreground)', fontSize: '0.82rem' }}>Not yet assigned</span>}
                                    </td>
                                    <td style={{ padding: '1.1rem 1.5rem', fontSize: '0.82rem', color: 'var(--muted-foreground)' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '1.1rem 1.5rem' }}>
                                        {r.status === 'PENDING' && (
                                            <button onClick={() => updateStatus.mutate({ id: r.id, status: 'CANCELLED' })} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '7px 14px', borderRadius: '8px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>
                                                Cancel
                                            </button>
                                        )}
                                        {r.status === 'ACCEPTED' && (
                                            <Link href={`/messages?userId=${r.acceptedBy?.id}`} style={{ background: '#e0f2fe', color: '#0284c7', padding: '7px 14px', borderRadius: '8px', fontWeight: 700, fontSize: '0.75rem', textDecoration: 'none', display: 'inline-block' }}>
                                                Message
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </main>

            {/* New Request Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'color-mix(in srgb, var(--foreground) 40%, transparent)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '1rem' }}>
                    <div style={{ background: 'var(--card)', borderRadius: '24px', padding: '2.5rem', width: '560px', maxWidth: '100%', boxShadow: '0 40px 70px color-mix(in srgb, var(--foreground) 25%, transparent)', position: 'relative' }}>
                        <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'var(--muted)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'var(--muted-foreground)', display: 'flex' }}>
                            <X size={18} />
                        </button>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--foreground)', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>New Help Request</h2>
                        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.88rem', marginBottom: '1.75rem' }}>Describe what you need help with and a helper will respond.</p>

                        {submitStatus === 'success' ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <Check size={48} color="#059669" style={{ marginBottom: '1rem' }} />
                                <p style={{ fontWeight: 700, color: '#059669', fontSize: '1rem' }}>Request posted successfully!</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '6px' }}>Subject / Title *</label>
                                    <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Help with Calculus Integration" style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid var(--muted)', outline: 'none', fontSize: '0.88rem', boxSizing: 'border-box', transition: 'border 0.15s' }} onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--muted)'} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '6px' }}>Course (optional)</label>
                                    <select value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })} style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid var(--muted)', outline: 'none', fontSize: '0.88rem', boxSizing: 'border-box', background: 'var(--card)' }}>
                                        <option value="">Select a course...</option>
                                        {courses?.map((c: any) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '6px' }}>Description</label>
                                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Provide more details about what you need help with..." rows={3} style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid var(--muted)', outline: 'none', fontSize: '0.88rem', boxSizing: 'border-box', resize: 'vertical' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '6px' }}>Preferred Date</label>
                                        <input type="date" value={form.preferredDate} onChange={e => setForm({ ...form, preferredDate: e.target.value })} style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid var(--muted)', outline: 'none', fontSize: '0.88rem', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '6px' }}>Preferred Time</label>
                                        <input type="time" value={form.preferredTime} onChange={e => setForm({ ...form, preferredTime: e.target.value })} style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid var(--muted)', outline: 'none', fontSize: '0.88rem', boxSizing: 'border-box' }} />
                                    </div>
                                </div>
                                <button type="submit" disabled={submitStatus === 'loading'} style={{ background: 'var(--foreground)', color: 'var(--chart-3)', border: 'none', padding: '13px', borderRadius: '12px', fontWeight: 800, fontSize: '0.95rem', cursor: submitStatus === 'loading' ? 'not-allowed' : 'pointer', marginTop: '0.5rem', opacity: submitStatus === 'loading' ? 0.7 : 1, transition: 'all 0.15s' }}>
                                    {submitStatus === 'loading' ? 'Posting...' : 'Post Request'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
