"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { trpc } from "@/trpc/client"
import StudentNavbar from "@/components/dashboard/StudentNavbar"
import LoadingDashboard from "@/components/dashboard/LoadingDashboard"
import { 
    Calendar, 
    Clock, 
    BookOpen, 
    ShieldCheck, 
    ArrowLeft,
    CheckCircle2,
    CalendarDays,
    Star,
    AlertCircle,
    User,
    ArrowRight
} from "lucide-react"

function BookForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const helperId = searchParams.get("helperId")
    
    // Form State
    const [title, setTitle] = useState("")
    const [courseId, setCourseId] = useState("")
    const [description, setDescription] = useState("")
    const [preferredDate, setPreferredDate] = useState("")
    const [preferredTime, setPreferredTime] = useState("")
    
    // UI State
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")
    
    const { data: user, isLoading: isLoadingUser } = trpc.users.me.useQuery()
    const { data: courses } = trpc.courses.list.useQuery()
    const { data: helper, isLoading: isLoadingHelper } = trpc.helpers.getProfile.useQuery(
        { userId: helperId as string },
        { enabled: !!helperId }
    )

    const createRequest = trpc.helpRequests.create.useMutation({
        onSuccess: (data) => {
            router.push(`/sessions`)
        },
        onError: (err) => {
            setError(err.message)
            setIsSubmitting(false)
        }
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!helperId || !title || !courseId) return
        
        setIsSubmitting(true)
        setError("")

        createRequest.mutate({
            title,
            courseId,
            description,
            preferredDate: preferredDate ? new Date(preferredDate) : undefined,
            preferredTime,
            acceptedById: helperId,
        })
    }

    if (isLoadingUser || isLoadingHelper) return <LoadingDashboard />
    if (!helper) return <div className="p-20 text-center">Helper not found</div>

    const getInitials = (name: string) => name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "H"

    return (
        <div className="dash-wrapper" style={{ background: 'var(--bg-color)', minHeight: '100vh', fontFamily: 'var(--font-plus-jakarta-sans), sans-serif' }}>
            <StudentNavbar />
            
            <main className="ch-page-main" style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 1.5rem' }}>
                <div style={{ animation: 'fadeInUp 0.5s ease-out' }}>
                    
                    <button 
                        onClick={() => router.back()}
                        style={{ background: 'none', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontWeight: 700, cursor: 'pointer', marginBottom: '2rem' }}
                    >
                        <ArrowLeft size={18} /> Back to Search
                    </button>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '3rem', alignItems: 'start' }}>
                        
                        {/* ── Left: Helper Summary ── */}
                        <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div style={{ 
                                background: 'var(--card-bg)', 
                                padding: '3rem 2rem', 
                                borderRadius: '24px', 
                                border: '1px solid var(--border-color)',
                                boxShadow: 'var(--shadow-md)',
                                textAlign: 'center'
                            }}>
                                <div style={{ 
                                    width: '90px', height: '90px', borderRadius: '24px', 
                                    background: 'var(--header-bg)', 
                                    color: 'var(--chart-3)', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                    fontWeight: 800, fontSize: '2rem', margin: '0 auto 1.5rem',
                                    boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                                }}>
                                    {getInitials(helper.user?.name || "H")}
                                </div>
                                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px', letterSpacing: '-0.02em' }}>{helper.user?.name}</h2>
                                <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1.5rem' }}>{helper.headline || "Verified Expert"}</p>
                                
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Rate</div>
                                        <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-main)' }}>₵{helper.hourlyRate}<span style={{ fontSize: '0.8rem', opacity: 0.6 }}>/hr</span></div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Rating</div>
                                        <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}><Star size={18} fill="#f59e0b" color="#f59e0b" /> 5.0</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                                    {helper.expertise?.map(e => (
                                        <span key={e.id} style={{ background: 'var(--sidebar)', color: 'var(--text-muted)', padding: '6px 14px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, border: '1px solid var(--border-color)' }}>{e.code}</span>
                                    ))}
                                </div>
                            </div>

                            <div style={{ 
                                background: 'color-mix(in srgb, var(--primary) 5%, transparent)', 
                                padding: '2rem', 
                                borderRadius: '24px',
                                border: '1px solid color-mix(in srgb, var(--primary) 10%, transparent)'
                            }}>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600, lineHeight: 1.6 }}>
                                    "Your request will be sent directly to {helper.user?.name?.split(" ")[0]}. Once they accept, you'll be able to chat and finalize the session time."
                                </p>
                            </div>
                        </aside>

                        {/* ── Right: Booking Form ── */}
                        <section style={{ 
                            background: 'var(--card-bg)', 
                            padding: '3rem', 
                            borderRadius: '32px', 
                            border: '1px solid var(--border-color)',
                            boxShadow: 'var(--shadow-lg)'
                        }}>
                            <div style={{ marginBottom: '2.5rem' }}>
                                <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.04em', marginBottom: '8px' }}>Book Expert Request</h1>
                                <p style={{ color: 'var(--text-muted)', fontWeight: 500, margin: 0 }}>Start your academic collaboration today.</p>
                            </div>

                            {error && (
                                <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
                                    <AlertCircle size={20} /> {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Session Title</label>
                                        <input 
                                            required
                                            placeholder="e.g. Calculus II Exam Prep"
                                            value={title}
                                            onChange={e => setTitle(e.target.value)}
                                            style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--sidebar)', outline: 'none', color: 'var(--text-main)', fontWeight: 600 }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Course</label>
                                        <select 
                                            required
                                            value={courseId}
                                            onChange={e => setCourseId(e.target.value)}
                                            style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--sidebar)', outline: 'none', color: 'var(--text-main)', fontWeight: 600 }}
                                        >
                                            <option value="">Select Course</option>
                                            {courses?.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>What do you need help with?</label>
                                    <textarea 
                                        rows={4}
                                        placeholder="Describe your session goals, specific questions, or topics you'd like to cover..."
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--sidebar)', outline: 'none', color: 'var(--text-main)', fontWeight: 600, resize: 'none' }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Preferred Date</label>
                                        <div style={{ position: 'relative' }}>
                                            <Calendar size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                                            <input 
                                                type="date"
                                                value={preferredDate}
                                                onChange={e => setPreferredDate(e.target.value)}
                                                style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--sidebar)', outline: 'none', color: 'var(--text-main)', fontWeight: 600 }}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Preferred Time</label>
                                        <div style={{ position: 'relative' }}>
                                            <Clock size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                                            <input 
                                                type="time"
                                                value={preferredTime}
                                                onChange={e => setPreferredTime(e.target.value)}
                                                style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--sidebar)', outline: 'none', color: 'var(--text-main)', fontWeight: 600 }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    style={{ 
                                        marginTop: '1rem',
                                        background: 'var(--primary)', 
                                        color: 'white', 
                                        padding: '1.25rem', 
                                        borderRadius: 'var(--radius-pill)', 
                                        fontWeight: 800, 
                                        fontSize: '1rem',
                                        border: 'none', 
                                        cursor: 'pointer',
                                        boxShadow: 'var(--shadow-glow)',
                                        transition: 'var(--transition)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px'
                                    }}
                                >
                                    {isSubmitting ? "Booking Expert..." : "Confirm Booking"} <ArrowRight size={20} />
                                </button>

                                <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                                    You'll be redirected to pay and unlock the chat on the next page.
                                </div>
                            </form>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default function BookPage() {
    return (
        <Suspense fallback={
            <div className="dash-wrapper" style={{ background: 'var(--bg-color)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontWeight: 800, color: 'var(--text-muted)' }}>Loading booking details...</div>
            </div>
        }>
            <BookForm />
        </Suspense>
    )
}
