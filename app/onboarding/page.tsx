"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import "./onboarding.css"

export default function OnboardingPage() {
    const [step, setStep] = useState(1)
    const router = useRouter()

    const nextStep = () => {
        if (step < 3) {
            setStep(step + 1)
        } else {
            router.push("/consultant-dashboard.html")
        }
    }

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="onboarding-container">
                        <div className="onboarding-header">
                            <h1 className="onboarding-title">How Campus Helper Works</h1>
                            <p className="onboarding-subtitle">
                                Get academic help when you need it in these three steps
                            </p>
                        </div>

                        <div className="onboarding-steps">
                            <div className="step-card">
                                <div className="step-number">1</div>
                                <div className="step-image">
                                    <Image src="/post a help request.svg" alt="Post Request" width={200} height={180} />
                                </div>
                                <h2 className="step-title">Post a Help Request</h2>
                                <p className="step-description">Describe the course or topic you need help with and submit your request.</p>
                            </div>

                            <div className="step-card">
                                <div className="step-number">2</div>
                                <div className="step-image">
                                    <Image src="/connect with a consultant.svg" alt="Connect Consultant" width={200} height={180} />
                                </div>
                                <h2 className="step-title">Connect with a Consultant</h2>
                                <p className="step-description">Browse available consultants, chat with them and choose who can assist you.</p>
                            </div>

                            <div className="step-card">
                                <div className="step-number">3</div>
                                <div className="step-image">
                                    <Image src="/start a session.svg" alt="Start Session" width={200} height={180} />
                                </div>
                                <h2 className="step-title">Start a Session</h2>
                                <p className="step-description">Collaborate in real-time and get the support you need to succeed</p>
                            </div>
                        </div>

                        <div className="onboarding-actions">
                            <button onClick={nextStep} className="onboarding-next-btn">Next</button>
                        </div>
                    </div>
                )
            case 2:
                return (
                    <div className="ob2-container">
                        <div className="ob2-header">
                            <h1 className="ob2-title">Want to help others and share your Knowledge</h1>
                            <p className="ob2-subtitle">
                                Join Campus Helper as a student helper. Respond to requests, chat with students, and
                                assist them in their academic journey.
                            </p>
                        </div>

                        <div className="ob2-content">
                            <div className="ob2-illustration">
                                <Image src="/onboarding2.svg" alt="Onboarding Illustration" width={400} height={340} />
                            </div>

                            <div className="ob2-panel">
                                <div className="ob2-panel-header">
                                    <div className="ob2-panel-icon">
                                        <Image src="/become a student helper.svg" alt="Helper Icon" width={32} height={32} />
                                    </div>
                                    <h2 className="ob2-panel-title">Become a student Helper</h2>
                                </div>

                                <div className="ob2-steps-list">
                                    <div className="ob2-step">
                                        <span className="ob2-step-number">1</span>
                                        <span className="ob2-step-text">Create your profile</span>
                                    </div>
                                    <div className="ob2-step">
                                        <span className="ob2-step-number">2</span>
                                        <span className="ob2-step-text">Set your availability</span>
                                    </div>
                                    <div className="ob2-step">
                                        <span className="ob2-step-number">3</span>
                                        <span className="ob2-step-text">Respond to Student requests</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="onboarding-actions">
                            <button onClick={nextStep} className="onboarding-next-btn">Next</button>
                        </div>
                    </div>
                )
            case 3:
                return (
                    <div className="ob3-container" style={{maxWidth: '800px'}}>
                        <div className="ob3-card">
                            <div className="ob3-header">
                                <h1 className="ob3-title">Ready to Get Started?</h1>
                                <p className="ob3-subtitle">
                                    Join Campus Helper today and connect with the support you need to succeed
                                </p>
                            </div>

                            <div className="ob3-illustrations">
                                <div className="ob3-image">
                                    <Image src="/onboarding3i.svg" alt="Celebration" width={280} height={240} />
                                </div>
                                <div className="ob3-image">
                                    <Image src="/onboarding3ii.svg" alt="Students" width={280} height={240} />
                                </div>
                            </div>

                            <div className="onboarding-actions">
                                <button onClick={nextStep} className="onboarding-next-btn">Get Started</button>
                            </div>
                        </div>
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <section className="onboarding-section">
            <nav className="navbar" style={{background: 'transparent', position: 'absolute', top: 0, width: '100%'}}>
                <div className="nav-container">
                    <Link href="/" className="logo">
                        <span className="logo-campus">Campus</span> <span className="logo-helper">Helper</span>
                    </Link>
                </div>
            </nav>
            {renderStep()}
        </section>
    )
}
