"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { trpc } from "@/trpc/client"
import "./onboarding.css"

const TOTAL_STEPS = 3

export default function OnboardingPage() {
    const [step, setStep] = useState(1)
    const [isHelper, setIsHelper] = useState(false)
    const router = useRouter()
    const setOnboarded = trpc.users.setOnboarded.useMutation()
    const becomeConsultant = trpc.users.becomeConsultant.useMutation()

    const nextStep = async () => {
        if (step < TOTAL_STEPS) {
            setStep(step + 1)
        } else {
            try {
                if (isHelper) {
                    await becomeConsultant.mutateAsync()
                }
                await setOnboarded.mutateAsync()
                // Helpers stay STUDENT until admin approves, so always land on student-dashboard
                router.push("/student-dashboard")
            } catch (error) {
                console.error("Failed to complete onboarding:", error)
                router.push("/student-dashboard")
            }
        }
    }

    return (
        <div className="ob-page">
            {/* Top Bar */}
            <div className="ob-topbar">
                <Link href="/" className="ob-brand">
                    <span className="campus">Campus</span>
                    <span className="helper">Helper</span>
                </Link>
                <div 
                    onClick={async () => {
                        await setOnboarded.mutateAsync()
                        router.push("/student-dashboard")
                    }}
                    className="ob-topbar-skip"
                    style={{ cursor: 'pointer' }}
                >
                    Skip →
                </div>
            </div>

            {/* Step Progress */}
            <div className="ob-progress">
                {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                    <div
                        key={i}
                        className={`ob-dot ${i + 1 === step ? "active" : i + 1 < step ? "done" : ""}`}
                    />
                ))}
            </div>

            {/* Step Content */}
            <div className="ob-content">
                {step === 1 && (
                    <>
                        <div className="ob-s1-header">
                            <div className="ob-s1-badge">
                                <span className="ob-s1-badge-dot" />
                                Step 1 of 3
                            </div>
                            <h1 className="ob-s1-title">How Campus Helper Works</h1>
                            <p className="ob-s1-sub">Get academic help when you need it in three simple steps</p>
                        </div>

                        <div className="ob-cards">
                            {[
                                { num: 1, src: "/post a help request.svg", title: "Post a Help Request", desc: "Describe the course or topic you need help with and submit your request." },
                                { num: 2, src: "/connect with a consultant.svg", title: "Connect with a Consultant", desc: "Browse available consultants, chat with them and choose who can assist you." },
                                { num: 3, src: "/start a session.svg", title: "Start a Session", desc: "Collaborate in real-time and get the support you need to succeed." },
                            ].map(card => (
                                <div className="ob-card" key={card.num}>
                                    <div className="ob-card-num">{card.num}</div>
                                    <div className="ob-card-img">
                                        <Image src={card.src} alt={card.title} width={200} height={168} />
                                    </div>
                                    <h2 className="ob-card-title">{card.title}</h2>
                                    <p className="ob-card-desc">{card.desc}</p>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {step === 2 && (
                    <>
                        <div className="ob-s2-wrap">
                            <div className="ob-s2-header">
                                <h1 className="ob-s2-title">Want to help others and share your knowledge?</h1>
                                <p className="ob-s2-sub">
                                    Join Campus Helper as a student helper — respond to requests, chat with students, and assist them on their academic journey.
                                </p>
                            </div>

                            <div className="ob-s2-illustration">
                                <Image src="/onboarding2.svg" alt="Become a Helper" width={420} height={340} />
                            </div>

                            <div className="ob-s2-panel">
                                <div className="ob-s2-panel-head">
                                    <div className="ob-s2-icon">
                                        <Image src="/become a student helper.svg" alt="Helper Icon" width={32} height={32} />
                                    </div>
                                    <h2 className="ob-s2-panel-title">Become a Student Helper</h2>
                                </div>
                                <div className="ob-s2-steps">
                                    {[
                                        { n: 1, text: "Create your profile" },
                                        { n: 2, text: "Set your availability" },
                                        { n: 3, text: "Respond to student requests" },
                                    ].map(s => (
                                        <div className="ob-s2-step" key={s.n}>
                                            <span className="ob-s2-step-num">{s.n}</span>
                                            <span className="ob-s2-step-text">{s.text}</span>
                                        </div>
                                    ))}
                                    {isHelper ? (
                                        <button 
                                            className="ob-btn secondary" 
                                            onClick={() => setIsHelper(false)}
                                            style={{ marginTop: '1.5rem', width: '100%', background: '#fff', color: '#007ea7', border: '2px solid #007ea7' }}
                                        >
                                            ✓ You're joining as a Helper
                                        </button>
                                    ) : (
                                        <button 
                                            className="ob-btn" 
                                            onClick={() => setIsHelper(true)}
                                            style={{ marginTop: '1.5rem', width: '100%' }}
                                        >
                                            Join as a Student Helper
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {step === 3 && (
                    <div className="ob-s3-card">
                        <div>
                            <h1 className="ob-s3-title">Ready to Get Started?</h1>
                            <p className="ob-s3-sub">Join Campus Helper today and connect with the support you need to succeed.</p>
                        </div>
                        <div className="ob-s3-images">
                            <Image src="/onboarding3i.svg" alt="Handshake" width={280} height={220} />
                            <Image src="/onboarding3ii.svg" alt="Students" width={280} height={220} />
                        </div>
                    </div>
                )}

                {/* Action Button */}
                <div className="ob-actions">
                    <button className="ob-btn" onClick={nextStep}>
                        {step < TOTAL_STEPS ? "Continue" : "Get Started"}
                        <span className="ob-btn-arrow">→</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
