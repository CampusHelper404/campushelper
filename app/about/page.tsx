"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"

export default function AboutPage() {
    const [scrolled, setScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // Navbar Scroll Effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    // Scroll reveal animations
    useEffect(() => {
        const revealElements = document.querySelectorAll('.about-reveal')
        if (revealElements.length === 0) return

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed')
                    observer.unobserve(entry.target)
                }
            })
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -40px 0px'
        })

        revealElements.forEach(el => observer.observe(el))

        return () => observer.disconnect()
    }, [])

    return (
        <div style={{ backgroundColor: "#f0f4f5", minHeight: "100vh" }}>
            {/* Navigation */}
            <nav className={`navbar ${scrolled ? "scrolled" : ""}`} id="navbar">
                <div className="nav-container">
                    <Link href="/" className="logo">
                        <span className="logo-campus">Campus</span>{" "}
                        <span className="logo-helper">Helper</span>
                    </Link>

                    <ul className={`nav-links ${mobileMenuOpen ? "active" : ""}`} id="nav-links">
                        <li><Link href="/about" className="nav-link nav-link-active" onClick={() => setMobileMenuOpen(false)}>About Us</Link></li>
                        <li><Link href="/auth/sign-in" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Login</Link></li>
                        <li><Link href="/auth/sign-up" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link></li>
                    </ul>

                    <button
                        className={`mobile-toggle ${mobileMenuOpen ? "active" : ""}`}
                        aria-label="Toggle navigation menu"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <span style={mobileMenuOpen ? { transform: "rotate(45deg) translate(5px, 5px)" } : {}}></span>
                        <span style={mobileMenuOpen ? { opacity: "0" } : {}}></span>
                        <span style={mobileMenuOpen ? { transform: "rotate(-45deg) translate(5px, -5px)" } : {}}></span>
                    </button>
                </div>
            </nav>

            <main>
                {/* About Hero Section */}
                <section className="about-hero" id="about-hero">
                    <div className="about-hero-container">
                        <div className="about-hero-badge">
                            <h1 className="about-hero-title">Helping Student Succeed on Campus</h1>
                        </div>
                        <p className="about-hero-description">
                            Campus Helper connects students with reliable tutoring support to improve understanding, boost confidence and
                            enhance academic performance. The platform allows learners to find help in various subjects, schedule sessions
                            and access learning resources in a simple and organized way.
                        </p>
                    </div>
                </section>

                {/* Features Section */}
                <section className="about-features" id="about-features" style={{ display: 'flex', justifyContent: 'center', padding: '0 2rem' }}>
                    <div className="about-features-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', maxWidth: '1100px', width: '100%', marginTop: '-80px', position: 'relative', zIndex: 10 }}>
                        <div className="feature-card about-reveal" style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,50,73,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
                            <div className="feature-icon-wrapper" style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f0f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Image src="/smart organization.svg" alt="Smart Organization icon" width={32} height={32} />
                            </div>
                            <h2 className="feature-title" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#003249' }}>Smart Organization</h2>
                            <p className="feature-description" style={{ fontSize: '0.9rem', color: '#4a6a7c', lineHeight: 1.6 }}>We help students manage timetables, tasks, and academic life with ease</p>
                        </div>

                        <div className="feature-card about-reveal" style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,50,73,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
                            <div className="feature-icon-wrapper" style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#e6f3f4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Image src="/student collaboration.svg" alt="Student Collaboration icon" width={32} height={32} />
                            </div>
                            <h2 className="feature-title" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#003249' }}>Student Collaboration</h2>
                            <p className="feature-description" style={{ fontSize: '0.9rem', color: '#4a6a7c', lineHeight: 1.6 }}>Connect with classmates, share notes and learn together in one space</p>
                        </div>

                        <div className="feature-card about-reveal" style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,50,73,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
                            <div className="feature-icon-wrapper" style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#e0f0f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Image src="/academic support.svg" alt="Academic Support icon" width={32} height={32} />
                            </div>
                            <h2 className="feature-title" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#003249' }}>Academic Support</h2>
                            <p className="feature-description" style={{ fontSize: '0.9rem', color: '#4a6a7c', lineHeight: 1.6 }}>Access study materials, reminders, and tools designed for student success.</p>
                        </div>
                    </div>
                </section>

                {/* Who Can Use Section */}
                <section className="about-info-section about-info-gray about-reveal" style={{ padding: '5rem 2rem', background: '#f5f8f9', marginTop: '4rem' }}>
                    <div className="about-info-container" style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1.2fr)', gap: '4rem', alignItems: 'center' }}>
                        <div className="about-info-text" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <h2 className="about-info-title" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#003249', lineHeight: 1.2 }}>Who Can Use Campus Helper?</h2>
                            <p className="about-info-description" style={{ fontSize: '1rem', color: '#4a6a7c', lineHeight: 1.7 }}>
                                Campus Helper is designed for university and college students who want to stay organized, share knowledge,
                                and improve their academic performance.
                            </p>
                        </div>
                        <div className="about-info-image" style={{ display: 'flex', justifyContent: 'center' }}>
                            <Image src="/who can use campus helper.svg" alt="Illustration of students using Campus Helper platform" width={400} height={350} style={{ maxWidth: '100%', height: 'auto' }} />
                        </div>
                    </div>
                </section>

                {/* Growing With Students Section */}
                <section className="about-info-section about-reveal" style={{ padding: '5rem 2rem', background: 'white' }}>
                    <div className="about-info-container" style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1.2fr)', gap: '4rem', alignItems: 'center' }}>
                        <div className="about-info-text" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', order: 1 }}>
                            <h2 className="about-info-title" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#003249', lineHeight: 1.2 }}>Growing With Students</h2>
                            <p className="about-info-description" style={{ fontSize: '1rem', color: '#4a6a7c', lineHeight: 1.7 }}>
                                We are continuously improving Campus Helper by adding new features based on student needs and feedback. Our
                                platform grows as students grow
                            </p>
                        </div>
                        <div className="about-info-image" style={{ display: 'flex', justifyContent: 'center' }}>
                            <Image src="/growing with students.svg" alt="Illustration showing Campus Helper growing with students" width={400} height={350} style={{ maxWidth: '100%', height: 'auto' }} />
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="about-footer" style={{ background: '#003249', color: 'white', padding: '4rem 2rem 2rem', textAlign: 'center' }}>
                <div className="about-footer-container" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
                    <p className="about-footer-message" style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#ccdbdc', maxWidth: '600px' }}>
                        Built for students, Campus Helper supports better organization, easier access to learning materials and
                        meaningful collaboration on campus
                    </p>
                    <div className="about-footer-copyright" style={{ fontSize: '0.85rem', color: '#5b8a9c', paddingTop: '2rem', borderTop: '1px solid rgba(204, 219, 220, 0.1)', width: '100%' }}>
                        <span className="copyright-icon">&copy;</span> 2026 Campus Helper. All rights Reserved
                    </div>
                </div>
            </footer>
        </div>
    )
}
