"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { trpc } from "@/trpc/client"
import StudentNavbar from "@/components/dashboard/StudentNavbar"
import LoadingDashboard from "@/components/dashboard/LoadingDashboard"
import { 
    ShieldCheck, 
    Upload, 
    FileText, 
    UserCheck, 
    ArrowLeft,
    CheckCircle2,
    Clock,
    AlertCircle,
    X,
    Image as ImageIcon,
    Loader2
} from "lucide-react"

export default function BecomeHelperPage() {
    const router = useRouter()
    
    // File State
    const [idFile, setIdFile] = useState<File | null>(null)
    const [transcriptFile, setTranscriptFile] = useState<File | null>(null)
    
    // UI State
    const [uploadingStage, setUploadingStage] = useState<"IDLE" | "UPLOADING" | "SUBMITTING">("IDLE")
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState("")
    
    const { data: user, isLoading: isLoadingUser } = trpc.users.me.useQuery()

    // ── Role Guard ───────────────────────────────────────────────────────────
    useEffect(() => {
        if (!isLoadingUser && user && user.role === 'HELPER') {
            router.push("/dashboard")
        }
    }, [user, isLoadingUser, router])

    const idInputRef = useRef<HTMLInputElement>(null)
    const transcriptInputRef = useRef<HTMLInputElement>(null)

    const submitDetails = trpc.verification.submitDetails.useMutation({
        onSuccess: () => {
            setIsSuccess(true)
            setUploadingStage("IDLE")
        },
        onError: (err) => {
            setError(err.message)
            setUploadingStage("IDLE")
        }
    })

    const uploadFile = async (file: File) => {
        const formData = new FormData()
        formData.append("file", file)

        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Upload failed")
        return data.url
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!idFile || !transcriptFile) return

        setUploadingStage("UPLOADING")
        setError("")

        try {
            const idResUrl = await uploadFile(idFile)
            const transcriptResUrl = await uploadFile(transcriptFile)

            setUploadingStage("SUBMITTING")
            await submitDetails.mutateAsync({
                idFrontUrl: idResUrl,
                transcriptUrl: transcriptResUrl,
            })
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred")
            setUploadingStage("IDLE")
        }
    }

    if (isLoadingUser || (user && user.role === 'HELPER')) {
        return <LoadingDashboard />
    }

    if (isSuccess) {
        return (
            <div className="dash-wrapper" style={{ background: 'var(--bg-color)', minHeight: '100vh' }}>
                <StudentNavbar />
                <main style={{ maxWidth: '600px', margin: '6rem auto', padding: '0 1.5rem', fontFamily: 'var(--font-plus-jakarta-sans), sans-serif' }}>
                    <div style={{ 
                        background: 'var(--card-bg)', 
                        padding: '4rem 3rem', 
                        borderRadius: 'var(--radius-lg)', 
                        textAlign: 'center', 
                        boxShadow: 'var(--shadow-lg)',
                        border: '1px solid var(--border-color)',
                        animation: 'fadeInUp 0.6s ease-out' 
                    }}>
                        <div style={{ background: '#d1fae5', color: '#059669', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                            <CheckCircle2 size={48} />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', letterSpacing: '-0.03em' }}>Application Sent!</h1>
                        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2.5rem', fontSize: '1rem', fontWeight: 500 }}>
                            We've received your documents and transcripts. Our team will review them and verify your helper status within 24-48 hours.
                        </p>
                        <button 
                            onClick={() => router.push('/student-dashboard')}
                            style={{ background: 'var(--primary)', color: 'var(--card)', width: '100%', padding: '1.25rem', borderRadius: 'var(--radius-pill)', fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: 'var(--shadow-glow)', transition: 'var(--transition)' }}
                        >
                            Return to Student Hub
                        </button>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="dash-wrapper" style={{ background: 'var(--bg-color)', minHeight: '100vh', fontFamily: 'var(--font-plus-jakarta-sans), sans-serif' }}>
            <StudentNavbar />
            
            <main className="dash-main ch-page-main" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ animation: 'fadeInUp 0.5s ease-out' }}>
                    
                    {/* Header Block */}
                    <div style={{ marginBottom: '2.5rem' }}>
                        <button 
                            onClick={() => router.back()}
                            style={{ background: 'color-mix(in srgb, var(--primary) 5%, transparent)', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', marginBottom: '1.5rem', padding: '10px 18px', borderRadius: 'var(--radius-pill)', fontSize: '0.82rem', transition: 'var(--transition)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'color-mix(in srgb, var(--primary) 10%, transparent)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'color-mix(in srgb, var(--primary) 5%, transparent)'}
                        >
                            <ArrowLeft size={16} /> Back
                        </button>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem' }}>
                            <div style={{ flex: 1, minWidth: '300px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <span style={{ background: 'color-mix(in srgb, var(--primary) 10%, transparent)', color: 'var(--primary)', padding: '4px 12px', borderRadius: 'var(--radius-pill)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Verification Hub
                                    </span>
                                </div>
                                <h1 style={{ fontSize: '2.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                                    Become a <span style={{ color: 'var(--primary)' }}>Helper.</span>
                                </h1>
                                <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 500, maxWidth: '600px', lineHeight: 1.5 }}>
                                    Help your peers excel in their studies while earning rewards and building a verified expert profile.
                                </p>
                            </div>
                            <div className="icon-badge ch-mobile-hide" style={{ padding: '0.5rem', borderRadius: '24px' }}>
                                <Image src="/verification-shield.png" alt="Verification" width={100} height={100} style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))' }} />
                            </div>
                        </div>
                    </div>

                    <div className="ch-bento-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
                        
                        {/* Left: Upload Form */}
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                            
                            {error && (
                                <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', padding: '1.25rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 700 }}>
                                    <AlertCircle size={20} />
                                    {error}
                                </div>
                            )}

                            {/* ID Card Bento */}
                            <div style={{ 
                                background: 'var(--card-bg)', 
                                padding: '2rem', 
                                borderRadius: 'var(--radius-lg)', 
                                border: '1px solid var(--border-color)',
                                boxShadow: 'var(--shadow-sm)'
                            }}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ padding: '8px', background: 'color-mix(in srgb, var(--primary) 10%, transparent)', borderRadius: '10px', color: 'var(--primary)' }}>
                                            <ImageIcon size={20} />
                                        </div>
                                        Student ID
                                    </h3>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 500 }}>Upload a clear photo of your student ID card.</p>
                                </div>
                                
                                <input type="file" ref={idInputRef} style={{ display: 'none' }} onChange={(e) => setIdFile(e.target.files?.[0] || null)} accept="image/*,.pdf" />

                                {idFile ? (
                                    <div style={{ background: 'var(--sidebar)', border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                                            <div style={{ background: 'var(--primary)', color: 'white', padding: '8px', borderRadius: '8px', flexShrink: 0 }}><ImageIcon size={20} /></div>
                                            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{idFile.name}</span>
                                        </div>
                                        <button type="button" onClick={() => setIdFile(null)} style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer', padding: '4px' }}><X size={20} /></button>
                                    </div>
                                ) : (
                                    <div 
                                        onClick={() => idInputRef.current?.click()}
                                        style={{ border: '2px dashed var(--border-color)', borderRadius: '18px', padding: '2.5rem 1rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', background: 'rgba(248, 250, 252, 0.03)' }}
                                    >
                                        <Upload size={32} color="var(--muted-foreground)" style={{ marginBottom: '1rem' }} />
                                        <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.9rem' }}>Upload ID Card</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>JPEG, PNG, or PDF up to 5MB</div>
                                    </div>
                                )}
                            </div>

                            {/* Transcript Bento */}
                            <div style={{ 
                                background: 'var(--card-bg)', 
                                padding: '2rem', 
                                borderRadius: 'var(--radius-lg)', 
                                border: '1px solid var(--border-color)',
                                boxShadow: 'var(--shadow-sm)'
                            }}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ padding: '8px', background: 'color-mix(in srgb, var(--primary) 10%, transparent)', borderRadius: '10px', color: 'var(--primary)' }}>
                                            <FileText size={20} />
                                        </div>
                                        Transcript
                                    </h3>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 500 }}>Provide a recent transcript to verify your expertise.</p>
                                </div>
                                
                                <input type="file" ref={transcriptInputRef} style={{ display: 'none' }} onChange={(e) => setTranscriptFile(e.target.files?.[0] || null)} accept="image/*,.pdf" />

                                {transcriptFile ? (
                                    <div style={{ background: 'var(--sidebar)', border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                                            <div style={{ background: 'var(--primary)', color: 'white', padding: '8px', borderRadius: '8px', flexShrink: 0 }}><FileText size={20} /></div>
                                            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{transcriptFile.name}</span>
                                        </div>
                                        <button type="button" onClick={() => setTranscriptFile(null)} style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer', padding: '4px' }}><X size={20} /></button>
                                    </div>
                                ) : (
                                    <div 
                                        onClick={() => transcriptInputRef.current?.click()}
                                        style={{ border: '2px dashed var(--border-color)', borderRadius: '18px', padding: '2.5rem 1rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', background: 'rgba(248, 250, 252, 0.03)' }}
                                    >
                                        <Upload size={32} color="var(--muted-foreground)" style={{ marginBottom: '1rem' }} />
                                        <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.9rem' }}>Upload Transcript</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>Highest resolution preferred</div>
                                    </div>
                                )}
                            </div>

                            <button 
                                type="submit"
                                disabled={uploadingStage !== "IDLE" || !idFile || !transcriptFile}
                                style={{ 
                                    width: '100%', 
                                    background: uploadingStage !== "IDLE" || !idFile || !transcriptFile ? 'var(--muted)' : 'var(--primary)', 
                                    color: uploadingStage !== "IDLE" || !idFile || !transcriptFile ? 'var(--muted-foreground)' : 'var(--card)', 
                                    padding: '1.25rem', 
                                    borderRadius: 'var(--radius-pill)', 
                                    fontWeight: 800, 
                                    border: 'none', 
                                    cursor: uploadingStage !== "IDLE" || !idFile || !transcriptFile ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s',
                                    fontSize: '1rem',
                                    boxShadow: uploadingStage !== "IDLE" || !idFile || !transcriptFile ? 'none' : 'var(--shadow-glow)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px'
                                }}
                            >
                                {uploadingStage === "IDLE" ? (
                                    <>Submit Application <CheckCircle2 size={24} /></>
                                ) : (
                                    <>
                                        <Loader2 className="animate-spin" size={24} /> 
                                        {uploadingStage === "UPLOADING" ? "Uploading..." : "Processing..."}
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Right Column: Guide */}
                        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ 
                                background: 'var(--card-bg)', 
                                padding: '2.5rem 2rem', 
                                borderRadius: 'var(--radius-lg)', 
                                border: '1px solid var(--border-color)',
                                boxShadow: 'var(--shadow-md)'
                            }}>
                                <h4 style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: '2rem', fontSize: '1.2rem', letterSpacing: '-0.02em' }}>Application Guide</h4>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                                    {[
                                        { icon: <Clock size={22} />, title: "24-48h Review", desc: "Our admins review every application manually to ensure quality." },
                                        { icon: <ShieldCheck size={22} />, title: "Privacy Guaranteed", desc: "Documents are encrypted and removed after verification." },
                                        { icon: <UserCheck size={22} />, title: "Verified Badge", desc: "Get a verified checkmark on your profile and start helping." }
                                    ].map((step, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '16px' }}>
                                            <div style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }}>{step.icon}</div>
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '4px' }}>{step.title}</div>
                                                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, fontWeight: 500 }}>{step.desc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ background: 'var(--sidebar)', padding: '1.5rem', borderRadius: '20px', marginTop: '2.5rem', border: '1px solid var(--border-color)' }}>
                                    <p style={{ fontSize: '0.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--primary)' }}>
                                        <AlertCircle size={18} /> Support Tip
                                    </p>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, fontWeight: 500 }}> Make sure your name matches your ID exactly to avoid processing delays.</p>
                                </div>
                            </div>
                        </aside>

                    </div>
                </div>
            </main>
        </div>
    )
}
