"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { trpc } from "@/trpc/client"
import StudentNavbar from "@/components/dashboard/StudentNavbar"
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

export default function BecomeConsultantPage() {
    const router = useRouter()
    
    // File State
    const [idFile, setIdFile] = useState<File | null>(null)
    const [transcriptFile, setTranscriptFile] = useState<File | null>(null)
    const [idUrl, setIdUrl] = useState("")
    const [transcriptUrl, setTranscriptUrl] = useState("")
    
    // UI State
    const [uploadingStage, setUploadingStage] = useState<"IDLE" | "UPLOADING" | "SUBMITTING">("IDLE")
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState("")
    const { data: user } = trpc.users.me.useQuery()

    // ── Role Guard ───────────────────────────────────────────────────────────
    useEffect(() => {
        if (user && user.role === 'CONSULTANT') {
            router.push("/dashboard")
        }
    }, [user, router])

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
            // 1. Upload ID
            const idResUrl = await uploadFile(idFile)
            setIdUrl(idResUrl)

            // 2. Upload Transcript
            const transcriptResUrl = await uploadFile(transcriptFile)
            setTranscriptUrl(transcriptResUrl)

            // 3. Submit TRPC
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

    if (isSuccess) {
        return (
            <div className="dash-wrapper" style={{ background: '#f8fafc', minHeight: '100vh' }}>
                <StudentNavbar />
                <main className="dash-main" style={{ marginTop: '100px', display: 'flex', justifyContent: 'center', padding: '0 1.5rem' }}>
                    <div style={{ 
                        background: '#fff', 
                        padding: '3rem', 
                        borderRadius: '24px', 
                        textAlign: 'center', 
                        maxWidth: '500px', 
                        boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
                        border: '1px solid #e2e8f0',
                        animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)' 
                    }}>
                        <div style={{ background: '#ecfdf5', color: '#10b981', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <CheckCircle2 size={48} />
                        </div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#003249', marginBottom: '1rem', letterSpacing: '-0.025em' }}>Application Received</h1>
                        <p style={{ color: '#64748b', lineHeight: 1.6, marginBottom: '2rem', fontSize: '1.05rem' }}>
                            Excellent! Your documents are being processed. Our team will review your ID and academic transcript shortly.
                        </p>
                        <button 
                            onClick={() => router.push('/student-dashboard')}
                            style={{ background: '#007ea7', color: '#fff', width: '100%', padding: '1rem', borderRadius: 'var(--radius-pill)', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'transform 0.2s' }}
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="dash-wrapper" style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <StudentNavbar />
            <style jsx>{`
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .glass-card {
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                }
                .upload-zone:hover {
                    border-color: #007ea7 !important;
                    background: #f1f5f9 !important;
                }
                .icon-badge {
                    display: none;
                }
                @media (min-width: 768px) {
                    .icon-badge {
                        display: block;
                    }
                }
            `}</style>
            
            <main className="dash-main" style={{ marginTop: '100px', paddingBottom: '4rem' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem', animation: 'slideUp 0.5s ease-out' }}>
                    
                    {/* Header Block */}
                    <div style={{ marginBottom: '3rem' }}>
                        <button 
                            onClick={() => router.back()}
                            style={{ background: 'rgba(0,0,0,0.03)', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748b', fontWeight: 700, cursor: 'pointer', marginBottom: '1.5rem', padding: '8px 16px', borderRadius: '12px', fontSize: '0.85rem' }}
                        >
                            <ArrowLeft size={16} /> Back to Dashboard
                        </button>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '2rem' }}>
                            <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#007ea7', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                                    Student Portal
                                </div>
                                <h1 style={{ fontSize: '2.5rem', fontWeight: 950, color: '#003249', marginBottom: '0.6rem', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                                    Join our <span style={{ color: '#007ea7' }}>Consultant</span> network.
                                </h1>
                                <p style={{ fontSize: '1.15rem', color: '#64748b', fontWeight: 500, maxWidth: '600px' }}>
                                    Help your peers succeed while earning recognition and building your profile.
                                </p>
                            </div>
                            <div className="icon-badge" style={{ background: '#ccdbdc', padding: '2rem', borderRadius: '24px' }}>
                                <ShieldCheck size={64} color="#007ea7" />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '2.5rem', alignItems: 'start' }}>
                        
                        {/* Left: Upload Form */}
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            
                            {error && (
                                <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600 }}>
                                    <AlertCircle size={20} />
                                    {error}
                                </div>
                            )}

                            {/* ID Upload */}
                            <div className="glass-card" style={{ padding: '1.75rem', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <h3 style={{ fontWeight: 800, color: '#003249', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <ImageIcon size={20} color="#007ea7" /> 
                                        Student ID Card
                                    </h3>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Please upload a clear photo of your front ID card.</p>
                                </div>
                                
                                <input 
                                    type="file" 
                                    ref={idInputRef}
                                    style={{ display: 'none' }}
                                    onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                                    accept="image/*,.pdf"
                                />

                                {idFile ? (
                                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '8px', borderRadius: '8px' }}><ImageIcon size={20} /></div>
                                            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#003249' }}>{idFile.name}</span>
                                        </div>
                                        <button type="button" onClick={() => setIdFile(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
                                    </div>
                                ) : (
                                    <div 
                                        className="upload-zone"
                                        onClick={() => idInputRef.current?.click()}
                                        style={{ border: '2px dashed #cbd5e1', borderRadius: '16px', padding: '2.5rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                                    >
                                        <Upload size={32} color="#94a3b8" style={{ marginBottom: '1rem' }} />
                                        <div style={{ fontWeight: 700, color: '#64748b' }}>Click to select your ID</div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>JPG, PNG or PDF (Max 5MB)</div>
                                    </div>
                                )}
                            </div>

                            {/* Transcript Upload */}
                            <div className="glass-card" style={{ padding: '1.75rem', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <h3 style={{ fontWeight: 800, color: '#003249', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FileText size={20} color="#007ea7" /> 
                                        Academic Transcript
                                    </h3>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Provide a recent transcript to verify your expertise.</p>
                                </div>
                                
                                <input 
                                    type="file" 
                                    ref={transcriptInputRef}
                                    style={{ display: 'none' }}
                                    onChange={(e) => setTranscriptFile(e.target.files?.[0] || null)}
                                    accept="image/*,.pdf"
                                />

                                {transcriptFile ? (
                                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '8px', borderRadius: '8px' }}><FileText size={20} /></div>
                                            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#003249' }}>{transcriptFile.name}</span>
                                        </div>
                                        <button type="button" onClick={() => setTranscriptFile(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
                                    </div>
                                ) : (
                                    <div 
                                        className="upload-zone"
                                        onClick={() => transcriptInputRef.current?.click()}
                                        style={{ border: '2px dashed #cbd5e1', borderRadius: '16px', padding: '2.5rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                                    >
                                        <Upload size={32} color="#94a3b8" style={{ marginBottom: '1rem' }} />
                                        <div style={{ fontWeight: 700, color: '#64748b' }}>Click to select Transcript</div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>JPG, PNG or PDF (Max 5MB)</div>
                                    </div>
                                )}
                            </div>

                            <button 
                                type="submit"
                                disabled={uploadingStage !== "IDLE" || !idFile || !transcriptFile}
                                style={{ 
                                    width: '100%', 
                                    background: uploadingStage !== "IDLE" || !idFile || !transcriptFile ? '#cbd5e1' : '#007ea7', 
                                    color: '#fff', 
                                    padding: '1.1rem', 
                                    borderRadius: '14px', 
                                    fontWeight: 800, 
                                    border: 'none', 
                                    cursor: uploadingStage !== "IDLE" || !idFile || !transcriptFile ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s',
                                    fontSize: '1rem',
                                    boxShadow: uploadingStage !== "IDLE" || !idFile || !transcriptFile ? 'none' : '0 10px 20px -5px rgba(0, 126, 167, 0.4)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px'
                                }}
                            >
                                {uploadingStage === "IDLE" ? (
                                    <>Submit Verified Application <CheckCircle2 size={24} /></>
                                ) : (
                                    <>
                                        <Loader2 className="animate-spin" size={24} /> 
                                        {uploadingStage === "UPLOADING" ? "Uploading Documents..." : "Finalizing Application..."}
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Right: Sidebar Info */}
                        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '24px', position: 'sticky', top: '120px' }}>
                                <h4 style={{ fontWeight: 900, color: '#003249', marginBottom: '1.25rem', fontSize: '1.1rem' }}>Verification Steps</h4>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {[
                                        { icon: <Clock size={20} />, title: "Review Process", desc: "Our team will manually review your documents within 24-48 hours." },
                                        { icon: <ShieldCheck size={20} />, title: "Secure Storage", desc: "Your personal ID is encrypted and deleted after verification." },
                                        { icon: <UserCheck size={20} />, title: "Expert Status", desc: "Once approved, you'll gain access to the Consultant Dashboard." }
                                    ].map((step, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '12px' }}>
                                            <div style={{ color: '#007ea7', flexShrink: 0 }}>{step.icon}</div>
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#003249', marginBottom: '2px' }}>{step.title}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>{step.desc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ background: '#f1f5f9', padding: '1.25rem', borderRadius: '16px', marginTop: '2rem' }}>
                                    <p style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <AlertCircle size={16} /> Need help?
                                    </p>
                                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>Contact our support team if you have issues with the verification process.</p>
                                </div>
                            </div>
                        </aside>

                    </div>
                </div>
            </main>
        </div>
    )
}
