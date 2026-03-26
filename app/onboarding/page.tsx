"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { trpc } from "@/trpc/client"
import { Stars, ShieldCheck, CheckCircle } from "lucide-react"
import "./onboarding.css"

const TOTAL_STEPS = 3

export default function OnboardingPage() {
    const [step, setStep] = useState(1)
    const router = useRouter()
    const setOnboarded = trpc.users.setOnboarded.useMutation()

    const nextStep = async () => {
        if (step < TOTAL_STEPS) {
            setStep(step + 1)
        } else {
            handleFinish()
        }
    }

    const prevStep = () => {
        if (step > 1) setStep(step - 1)
    }

    const handleFinish = async () => {
        try {
            await setOnboarded.mutateAsync()
            router.push("/student-dashboard")
        } catch (error) {
            console.error("Failed to complete onboarding:", error)
            router.push("/student-dashboard")
        }
    }

    return (
        <div className="ob-page" style={{ 
            background: 'var(--bg-color)', 
            minHeight: '100vh',
            fontFamily: 'var(--font-plus-jakarta-sans), sans-serif',
            color: 'var(--text-main)'
        }}>
            
            <header className="ob-topbar" style={{ 
                maxWidth: '1200px', 
                margin: '0 auto', 
                padding: '2rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '1.2rem' }}>C</div>
                    <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-main)', letterSpacing: '-0.03em' }}>CampusHelper</span>
                </div>
                {step < 3 && (
                    <button onClick={prevStep} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', opacity: step === 1 ? 0.3 : 1, pointerEvents: step === 1 ? 'none' : 'auto' }}>
                        Go Back
                    </button>
                )}
            </header>

            <main className="ch-page-main" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {step === 1 && (
                    <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto', animation: 'fadeIn 0.6s ease-out' }}>
                        <h1 className="ob-s1-title" style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                            Welcome to the <span style={{ color: 'var(--primary)' }}>Future</span> of Campus Help.
                        </h1>
                        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '3rem', fontWeight: 500, lineHeight: 1.6 }}>
                            Tired of struggling alone? Join thousands of students getting instant help from subject experts in their own campus.
                        </p>
                        
                        <div className="ob-cards" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '4rem' }}>
                            {[
                                { title: "Get Help", desc: "Connect with expert helpers for courses, assignments, and skills.", icon: Stars, img: "/ob-student.png" },
                                { title: "Be a Helper", desc: "Share your knowledge, help others, and build your profile.", icon: ShieldCheck, img: "/ob-helper.png" }
                            ].map((card, i) => (
                                <div key={i} className="ob-card" style={{ 
                                    background: 'var(--card-bg)', 
                                    padding: '2.5rem 2rem', 
                                    borderRadius: '24px', 
                                    border: '1px solid var(--border-color)',
                                    boxShadow: 'var(--shadow-md)',
                                    transition: 'var(--transition)',
                                    textAlign: 'left'
                                }}>
                                    <div className="ob-card-img" style={{ height: '180px', position: 'relative', marginBottom: '2rem', background: 'var(--sidebar)', borderRadius: '16px', overflow: 'hidden' }}>
                                        <Image src={card.img} alt={card.title} fill style={{ objectFit: 'contain', padding: '1rem' }} />
                                    </div>
                                    <card.icon size={32} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '8px' }}>{card.title}</h3>
                                    <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 500, lineHeight: 1.5 }}>{card.desc}</p>
                                </div>
                            ))}
                        </div>

                        <button onClick={nextStep} className="ob-btn" style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '14px 52px', borderRadius: 'var(--radius-pill)', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: 'var(--shadow-glow)', transition: 'var(--transition)' }}>
                            Let's Get Started
                        </button>
                    </div>
                )}
                
                {step === 2 && (
                    <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
                        <div className="ob-s2-wrap" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '4rem', alignItems: 'center' }}>
                            <div className="ob-s2-header">
                                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>Verify Your Campus Identity</h2>
                                <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '2.5rem', fontWeight: 500, lineHeight: 1.6 }}>
                                    Security is our top priority. To keep CampusHelper a safe space, we require all users to verify their student status.
                                </p>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
                                    {[
                                        { t: "Verified Experts", d: "Interact only with authenticated students and helpers." },
                                        { t: "Secure Payments", d: "Handled through our campus-safe escrow system." },
                                        { t: "Community Trust", d: "Built by students, for students, with full accountability." }
                                    ].map((f, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '1.25rem' }}>
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <CheckCircle size={16} />
                                            </div>
                                            <div>
                                                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>{f.t}</h4>
                                                <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>{f.d}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button onClick={nextStep} className="ob-btn" style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '14px 52px', borderRadius: 'var(--radius-pill)', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: 'var(--shadow-glow)' }}>
                                    Verify My Status
                                </button>
                            </div>
                            <div className="ob-s2-illustration" style={{ position: 'relative', height: '450px', background: 'var(--sidebar)', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Image src="/ob-verify.png" alt="Verification" fill style={{ objectFit: 'contain', padding: '3rem' }} />
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.6s ease-out' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.03em' }}>You're All Set!</h2>
                        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '4rem', fontWeight: 500 }}>
                            Welcome to the community. Your journey to academic excellence begins now.
                        </p>

                        <div className="ob-s3-images" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '4rem' }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} className="ob-s3-card" style={{ padding: '2rem', background: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                                    <h4 style={{ margin: 0, fontWeight: 800, marginBottom: '1.5rem' }}>Step {i}</h4>
                                    <div style={{ height: '120px', position: 'relative' }}>
                                        <Image src={`/ob-final-${i}.png`} alt="Success" fill style={{ objectFit: 'contain' }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button onClick={handleFinish} className="ob-btn" style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '14px 64px', borderRadius: 'var(--radius-pill)', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', boxShadow: 'var(--shadow-glow)' }}>
                            Go to Dashboard
                        </button>
                    </div>
                )}
            </main>
        </div>
    )
}
