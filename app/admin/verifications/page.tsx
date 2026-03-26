"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { trpc } from "@/trpc/client"
import AdminNavbar from "@/components/dashboard/AdminNavbar"
import { CheckCircle, XCircle, FileText, User } from "lucide-react"

const pageStyle: React.CSSProperties = { minHeight: '100vh', background: 'var(--background)', fontFamily: "'Inter', -apple-system, sans-serif" }
const mainStyle: React.CSSProperties = { maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }

export default function AdminVerificationsPage() {
    const router = useRouter()
    const { data: currentUser, isLoading } = trpc.users.me.useQuery()
    const [filter, setFilter] = useState<string>("PENDING")
    const { data: verifications, refetch, isLoading: vLoading } = trpc.verificationQueue.list.useQuery({ status: filter })
    const [noteModal, setNoteModal] = useState<{ id: string, action: 'APPROVED' | 'REJECTED' } | null>(null)
    const [reviewNote, setReviewNote] = useState("")

    const reviewMutation = trpc.verificationQueue.review.useMutation({
        onSuccess: () => { setNoteModal(null); setReviewNote(""); refetch() }
    })

    useEffect(() => {
        if (!isLoading && currentUser && (currentUser as any).role !== 'ADMIN') router.push('/student-dashboard')
    }, [currentUser, isLoading, router])

    const handleReview = () => {
        if (!noteModal) return
        reviewMutation.mutate({ id: noteModal.id, status: noteModal.action, reviewerNote: reviewNote })
    }

    return (
        <div style={pageStyle}>
            <AdminNavbar />
            <main className="ch-page-main" style={mainStyle}>
                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Admin Panel</div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--foreground)', letterSpacing: '-0.03em', margin: 0 }}>Verification Queue</h1>
                        <p style={{ color: 'var(--muted-foreground)', marginTop: '6px' }}>Review helper applications and approve or reject them.</p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                    {['PENDING', 'APPROVED', 'REJECTED'].map(s => (
                        <button key={s} onClick={() => setFilter(s)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, background: filter === s ? 'var(--foreground)' : 'var(--card)', color: filter === s ? 'var(--chart-3)' : 'var(--muted-foreground)', boxShadow: filter === s ? 'none' : '0 1px 3px color-mix(in srgb, var(--foreground) 6%, transparent)' }}>
                            {s}
                        </button>
                    ))}
                </div>

                {/* Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {vLoading ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Loading verifications...</div>
                    ) : verifications?.length === 0 ? (
                        <div style={{ background: 'var(--card)', borderRadius: '16px', padding: '4rem', textAlign: 'center', color: 'var(--muted-foreground)', boxShadow: '0 2px 8px color-mix(in srgb, var(--foreground) 6%, transparent)' }}>
                            <CheckCircle size={48} style={{ opacity: 0.15, marginBottom: '1rem' }} />
                            <p>No {filter.toLowerCase()} applications.</p>
                        </div>
                    ) : verifications?.map((v: any) => (
                        <div key={v.id} style={{ background: 'var(--card)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px color-mix(in srgb, var(--foreground) 6%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--foreground)', color: 'var(--chart-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                                    {v.user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, color: 'var(--foreground)', fontSize: '1rem' }}>{v.user?.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>{v.user?.email}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '4px' }}>Applied {new Date(v.createdAt).toLocaleDateString()}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {v.idFrontUrl && <a href={v.idFrontUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 13px', borderRadius: '8px', background: 'var(--muted)', color: 'var(--foreground)', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}><FileText size={13} /> ID Front</a>}
                                {v.idBackUrl && <a href={v.idBackUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 13px', borderRadius: '8px', background: 'var(--muted)', color: 'var(--foreground)', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}><FileText size={13} /> ID Back</a>}
                                {v.transcriptUrl && <a href={v.transcriptUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 13px', borderRadius: '8px', background: 'var(--muted)', color: 'var(--foreground)', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}><FileText size={13} /> Transcript</a>}
                                {filter === 'PENDING' && (
                                    <>
                                        <button onClick={() => setNoteModal({ id: v.id, action: 'APPROVED' })} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#d1fae5', color: '#059669', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}><CheckCircle size={14} /> Approve</button>
                                        <button onClick={() => setNoteModal({ id: v.id, action: 'REJECTED' })} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#fee2e2', color: '#dc2626', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}><XCircle size={14} /> Reject</button>
                                    </>
                                )}
                                {filter !== 'PENDING' && (
                                    <span style={{ padding: '7px 14px', borderRadius: '8px', background: filter === 'APPROVED' ? '#d1fae5' : '#fee2e2', color: filter === 'APPROVED' ? '#059669' : '#dc2626', fontWeight: 800, fontSize: '0.78rem' }}>
                                        {filter}
                                        {v.reviewerNote && ` — "${v.reviewerNote}"`}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Confirm Modal */}
                {noteModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
                        <div style={{ background: 'var(--card)', borderRadius: '20px', padding: '2rem', width: '480px', maxWidth: '90vw', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
                            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--foreground)', fontSize: '1.2rem', fontWeight: 800 }}>
                                {noteModal.action === 'APPROVED' ? '✅ Approve Application' : '❌ Reject Application'}
                            </h3>
                            <p style={{ fontSize: '0.87rem', color: 'var(--muted-foreground)', marginBottom: '1.25rem' }}>
                                {noteModal.action === 'APPROVED' ? 'The user will be promoted to HELPER role.' : 'The application will be rejected.'}
                            </p>
                            <textarea
                                value={reviewNote}
                                onChange={e => setReviewNote(e.target.value)}
                                placeholder="Optional note for the applicant..."
                                rows={3}
                                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--muted)', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box', resize: 'vertical' }}
                            />
                            <div style={{ display: 'flex', gap: '8px', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
                                <button onClick={() => setNoteModal(null)} style={{ padding: '9px 20px', borderRadius: '10px', border: '1px solid var(--muted)', background: 'var(--sidebar)', color: 'var(--muted-foreground)', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleReview} disabled={reviewMutation.isPending} style={{ padding: '9px 20px', borderRadius: '10px', border: 'none', background: noteModal.action === 'APPROVED' ? '#059669' : '#dc2626', color: 'var(--card)', fontWeight: 700, cursor: 'pointer' }}>
                                    {reviewMutation.isPending ? 'Saving...' : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
