"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { trpc } from "@/trpc/client"
import "./onboarding.css"

const TOTAL_STEPS = 2

export default function OnboardingPage() {
    const [step, setStep] = useState(1)
    const router = useRouter()
    const setOnboarded = trpc.users.setOnboarded.useMutation()

    const nextStep = async () => {
        if (step < TOTAL_STEPS) {
            setStep(step + 1)
        } else {
            try {
                await setOnboarded.mutateAsync()
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
                                Step 1 of 2
                            </div>
                            <h1 className="ob-s1-title">How Campus Helper Works</h1>
                            <p className="ob-s1-sub">Get academic help when you need it in three simple steps</p>
                        </div>

                        <div className="ob-cards">
                            {[
                                { num: 1, src: "/post a help request.svg", title: "Post a Help Request", desc: "Describe the course or topic you need help with and submit your request." },
                                { num: 2, src: "/connect with a helper.svg", title: "Connect with a Helper", desc: "Browse available helpers, chat with them and choose who can assist you." },
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
