"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { trpc } from "@/trpc/client"
import { Stars, ShieldCheck, CheckCircle, ArrowRight } from "lucide-react"
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
            router.push("/dashboard")
        } catch (error) {
            console.error("Failed to complete onboarding:", error)
            router.push("/dashboard")
        }
    }

    return (
        <div className="ob-page">
            <header className="ob-topbar">
                <div className="ob-brand">
                    <span className="campus">Campus</span>
                    <span className="helper">Helper</span>
                </div>
                
                <div className="ob-progress">
                    {[1, 2, 3].map((s) => (
                        <div 
                            key={s} 
                            className={`ob-dot ${step === s ? 'active' : ''} ${step > s ? 'done' : ''}`} 
                        />
                    ))}
                </div>

                <button 
                    onClick={prevStep} 
                    className="ob-topbar-skip"
                    style={{ opacity: step === 1 ? 0 : 1, pointerEvents: step === 1 ? 'none' : 'auto' }}
                >
                    Back
                </button>
            </header>

            <main className="ob-content">
                {step === 1 && (
                    <div className="ob-s1-header" style={{ animation: 'ob-fadeUp 0.6s ease-out' }}>
                        <div className="ob-s1-badge">
                            <div className="ob-s1-badge-dot" />
                            Welcome to CampusHelper
                        </div>
                        <h1 className="ob-s1-title">The Future of Campus Support</h1>
                        <p className="ob-s1-sub">
                            Join a community of students helping students. Get the support you need or share your expertise to earn.
                        </p>
                        
                        <div className="ob-cards">
                            <div className="ob-card">
                                <div className="ob-card-num">1</div>
                                <div className="ob-card-img">
                                    <Image src="/academic support.svg" alt="Get Help" width={200} height={160} />
                                </div>
                                <h3 className="ob-card-title">Get Expert Help</h3>
                                <p className="ob-card-desc">Connect with verified student experts for any subject or skill.</p>
                            </div>
                            
                            <div className="ob-card">
                                <div className="ob-card-num">2</div>
                                <div className="ob-card-img">
                                    <Image src="/become a student helper.svg" alt="Be a Helper" width={200} height={160} />
                                </div>
                                <h3 className="ob-card-title">Become a Helper</h3>
                                <p className="ob-card-desc">Monetize your knowledge and build a professional campus profile.</p>
                            </div>

                            <div className="ob-card">
                                <div className="ob-card-num">3</div>
                                <div className="ob-card-img">
                                    <Stars size={64} color="var(--ob-primary-lt)" />
                                </div>
                                <h3 className="ob-card-title">Grow Together</h3>
                                <p className="ob-card-desc">Build your reputation and contribute to your campus success.</p>
                            </div>
                        </div>

                        <div className="ob-actions">
                            <button onClick={nextStep} className="ob-btn">
                                Let's Get Started <ArrowRight className="ob-btn-arrow" size={18} />
                            </button>
                        </div>
                    </div>
                )}
                
                {step === 2 && (
                    <div style={{ animation: 'ob-scaleIn 0.5s ease-out' }}>
                        <div className="ob-s2-header">
                            <h2 className="ob-s2-title">Trust & Security First</h2>
                            <p className="ob-s2-sub">
                                We've built a secure ecosystem so you can focus on learning and collaborating with peace of mind.
                            </p>
                        </div>

                        <div className="ob-s2-wrap">
                            <div className="ob-s2-illustration">
                                <Image src="/onboarding2.svg" alt="Security" width={400} height={340} />
                            </div>
                            
                            <div className="ob-s2-panel">
                                <div className="ob-s2-panel-head">
                                    <div className="ob-s2-icon"><ShieldCheck color="var(--ob-primary)" /></div>
                                    <div className="ob-s2-panel-title">Our Security Standards</div>
                                </div>
                                
                                <div className="ob-s2-steps">
                                    <div className="ob-s2-step">
                                        <div className="ob-s2-step-num">1</div>
                                        <div className="ob-s2-step-text">Verified Student Identities</div>
                                    </div>
                                    <div className="ob-s2-step">
                                        <div className="ob-s2-step-num">2</div>
                                        <div className="ob-s2-step-text">Secure Milestone Payments</div>
                                    </div>
                                    <div className="ob-s2-step">
                                        <div className="ob-s2-step-num">3</div>
                                        <div className="ob-s2-step-text">Campus-Only Community</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="ob-actions">
                            <button onClick={nextStep} className="ob-btn">
                                Continue <ArrowRight className="ob-btn-arrow" size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="ob-s3-card" style={{ animation: 'ob-scaleIn 0.6s cubic-bezier(0.16,1,0.3,1)' }}>
                        <div style={{ 
                            width: '80px', 
                            height: '80px', 
                            background: 'var(--ob-primary-lt)', 
                            borderRadius: '50%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            marginBottom: '1rem',
                            opacity: 0.8
                        }}>
                            <CheckCircle size={40} color="white" />
                        </div>
                        <h2 className="ob-s3-title">You're Ready to Explore!</h2>
                        <p className="ob-s3-sub">
                            Your account is set up and ready. Dive into the community and find the help you need or start your journey as a helper.
                        </p>

                        <div className="ob-s3-images">
                            <Image src="/connect with a helper.svg" alt="Connect" width={300} height={200} />
                            <Image src="/student collaboration.svg" alt="Collaborate" width={300} height={200} />
                        </div>

                        <div className="ob-actions">
                            <button onClick={handleFinish} className="ob-btn">
                                Enter Dashboard <ArrowRight className="ob-btn-arrow" size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
