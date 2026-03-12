"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"

export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const heroRef = useRef<HTMLElement>(null)
    const imgTopRef = useRef<HTMLDivElement>(null)
    const imgBottomRef = useRef<HTMLDivElement>(null)

    // Animated Counters State
    const [studentsCount, setStudentsCount] = useState(0)
    const [consultantsCount, setConsultantsCount] = useState(0)
    const [successRate, setSuccessRate] = useState(0)
    const statsRef = useRef<HTMLDivElement>(null)

    // Navbar Scroll Effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    // Parallax & Mouse Move Effects
    useEffect(() => {
        const hero = heroRef.current
        
        const handleMouseMove = (e: MouseEvent) => {
            if (window.innerWidth <= 768) return // Disable on mobile
            
            const { clientX, clientY } = e
            const centerX = window.innerWidth / 2
            const centerY = window.innerHeight / 2
            const moveX = (clientX - centerX) / 50
            const moveY = (clientY - centerY) / 50

            if (imgTopRef.current) {
                imgTopRef.current.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${moveX * 0.1}deg)`
            }
            if (imgBottomRef.current) {
                imgBottomRef.current.style.transform = `translate(${-moveX}px, ${-moveY}px) rotate(${-moveX * 0.1}deg)`
            }
        }

        const handleScroll = () => {
             if (window.innerWidth <= 768) return
             const scrollY = window.scrollY
             const speed = 0.05
             if (imgTopRef.current) imgTopRef.current.style.marginTop = `${scrollY * speed}px`
             if (imgBottomRef.current) imgBottomRef.current.style.marginTop = `${scrollY * -speed}px`
        }

        hero?.addEventListener("mousemove", handleMouseMove)
        window.addEventListener("scroll", handleScroll)

        return () => {
            hero?.removeEventListener("mousemove", handleMouseMove)
            window.removeEventListener("scroll", handleScroll)
        }
    }, [])

    // Animated Counters
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    animateValue(setStudentsCount, 1000)
                    animateValue(setConsultantsCount, 500)
                    animateValue(setSuccessRate, 95)
                    observer.disconnect()
                }
            },
            { threshold: 0.1 }
        )

        if (statsRef.current) {
            observer.observe(statsRef.current)
        }

        return () => observer.disconnect()
    }, [])

    const animateValue = (setter: (val: number) => void, end: number) => {
        const duration = 1500
        const start = 0
        const startTime = performance.now()

        const step = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            setter(Math.floor(start + (end - start) * eased))

            if (progress < 1) {
                requestAnimationFrame(step)
            }
        }
        requestAnimationFrame(step)
    }

    return (
        <>
            {/* Navigation */}
            <nav className={`navbar ${scrolled ? "scrolled" : ""}`} id="navbar">
                <div className="nav-container">
                    <Link href="/" className="logo">
                        <span className="logo-campus">Campus</span>{" "}
                        <span className="logo-helper">Helper</span>
                    </Link>

                    <ul className={`nav-links ${mobileMenuOpen ? "active" : ""}`} id="nav-links">
                        <li><Link href="/about" className="nav-link" onClick={() => setMobileMenuOpen(false)}>About Us</Link></li>
                        <li><Link href="/faq" className="nav-link" onClick={() => setMobileMenuOpen(false)}>FAQ</Link></li>
                        <li><Link href="/auth/sign-in" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Login</Link></li>
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

            {/* Hero Section */}
            <main>
                <section className="hero" id="hero-section" ref={heroRef}>
                    <div className="hero-container">
                        
                        <div className="hero-content">
                            <div className="trust-badge">
                                <span className="badge-dot"></span>
                                Trusted by 1000+ students
                            </div>

                            <h1 className="hero-title">Campus Helper</h1>

                            <p className="hero-subtitle about-reveal revealed">
                                Connect with academic consultants and get the help you need for your courses
                            </p>

                            <div className="stats about-reveal revealed" ref={statsRef}>
                                <div className="stat-item">
                                    <span className="stat-number">{studentsCount}+</span>
                                    <span className="stat-label">Students</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">{consultantsCount}+</span>
                                    <span className="stat-label">Consultants</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">{successRate}%</span>
                                    <span className="stat-label">Success Rate</span>
                                </div>
                            </div>

                            <Link href="/auth/sign-up" className="cta-button">
                                Get Started free
                            </Link>
                        </div>

                        <div className="hero-images">
                            <div className="image-card image-card-top" ref={imgTopRef}>
                                <Image
                                    src="/online-learning.svg"
                                    alt="Student learning online with academic resources and grading tools"
                                    width={400}
                                    height={300}
                                    priority
                                />
                            </div>
                            <div className="image-card image-card-bottom" ref={imgBottomRef}>
                                <Image
                                    src="/consultant.svg"
                                    alt="Academic consultant presenting educational material on a whiteboard"
                                    width={400}
                                    height={300}
                                    priority
                                />
                            </div>
                        </div>

                    </div>
                </section>
            </main>
        </>
    )
}
