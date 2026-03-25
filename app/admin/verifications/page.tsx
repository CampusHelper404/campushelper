"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { trpc } from "@/trpc/client"
import AdminNavbar from "@/components/dashboard/AdminNavbar"
import { CheckCircle, XCircle, FileText, User } from "lucide-react"

const pageStyle: React.CSSProperties = { minHeight: '100vh', background: '#f0f4f5', fontFamily: "'Inter', -apple-system, sans-serif", paddingTop: '64px' }
const mainStyle: React.CSSProperties = { maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }

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
            <main style={mainStyle}>
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#007ea7', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Admin Panel</div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#003249', letterSpacing: '-0.03em', margin: 0 }}>Verification Queue</h1>
                    <p style={{ color: '#4a6a7c', marginTop: '6px' }}>Review helper applications and approve or reject them.</p>
                </div>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '1.25rem' }}>
                    {['PENDING', 'APPROVED', 'REJECTED'].map(s => (
                        <button key={s} onClick={() => setFilter(s)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, background: filter === s ? '#003249' : '#fff', color: filter === s ? '#9ad1d4' : '#64748b', boxShadow: filter === s ? 'none' : '0 1px 3px rgba(0,50,73,0.06)' }}>
                            {s}
                        </button>
                    ))}
                </div>

                {/* Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {vLoading ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading verifications...</div>
                    ) : verifications?.length === 0 ? (
                        <div style={{ background: '#fff', borderRadius: '16px', padding: '4rem', textAlign: 'center', color: '#94a3b8', boxShadow: '0 2px 8px rgba(0,50,73,0.06)' }}>
                            <CheckCircle size={48} style={{ opacity: 0.15, marginBottom: '1rem' }} />
                            <p>No {filter.toLowerCase()} applications.</p>
                        </div>
                    ) : verifications?.map((v: any) => (
                        <div key={v.id} style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,50,73,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#003249', color: '#9ad1d4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                                    {v.user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, color: '#003249', fontSize: '1rem' }}>{v.user?.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{v.user?.email}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Applied {new Date(v.createdAt).toLocaleDateString()}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {v.idFrontUrl && <a href={v.idFrontUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 13px', borderRadius: '8px', background: '#f1f5f9', color: '#003249', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}><FileText size={13} /> ID Front</a>}
                                {v.idBackUrl && <a href={v.idBackUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 13px', borderRadius: '8px', background: '#f1f5f9', color: '#003249', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}><FileText size={13} /> ID Back</a>}
                                {v.transcriptUrl && <a href={v.transcriptUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 13px', borderRadius: '8px', background: '#f1f5f9', color: '#003249', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}><FileText size={13} /> Transcript</a>}
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
                        <div style={{ background: '#fff', borderRadius: '20px', padding: '2rem', width: '480px', maxWidth: '90vw', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
                            <h3 style={{ margin: '0 0 0.5rem', color: '#003249', fontSize: '1.2rem', fontWeight: 800 }}>
                                {noteModal.action === 'APPROVED' ? '✅ Approve Application' : '❌ Reject Application'}
                            </h3>
                            <p style={{ fontSize: '0.87rem', color: '#64748b', marginBottom: '1.25rem' }}>
                                {noteModal.action === 'APPROVED' ? 'The user will be promoted to HELPER role.' : 'The application will be rejected.'}
                            </p>
                            <textarea
                                value={reviewNote}
                                onChange={e => setReviewNote(e.target.value)}
                                placeholder="Optional note for the applicant..."
                                rows={3}
                                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box', resize: 'vertical' }}
                            />
                            <div style={{ display: 'flex', gap: '8px', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
                                <button onClick={() => setNoteModal(null)} style={{ padding: '9px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleReview} disabled={reviewMutation.isPending} style={{ padding: '9px 20px', borderRadius: '10px', border: 'none', background: noteModal.action === 'APPROVED' ? '#059669' : '#dc2626', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
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
