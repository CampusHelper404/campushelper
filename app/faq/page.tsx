"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

const faqs = [
    {
        id: 1,
        question: "How do I register as a student?",
        answer: "To register as a student, click the 'Get Started' button on the homepage. Fill in your university email, create a password, and complete your student profile. Verification is done through your campus email address."
    },
    {
        id: 2,
        question: "How do I become a consultant?",
        answer: "To become a consultant, register on the platform and select the 'Become a Consultant' option. You'll need to provide your academic credentials, areas of expertise, and available schedule. Once reviewed, you'll be approved to start helping students."
    },
    {
        id: 3,
        question: "How are the sessions conducted?",
        answer: "Sessions can be conducted either in-person on campus or online through the platform's built-in video and chat tools. Students and consultants agree on the format when scheduling. Each session typically lasts between 30 to 60 minutes."
    },
    {
        id: 4,
        question: "How do I cancel a Session?",
        answer: "You can cancel a session from your dashboard by going to 'My Sessions' and clicking 'Cancel' on the relevant session. Please cancel at least 2 hours before the scheduled time to avoid any penalties or negative impact on your profile."
    },
    {
        id: 5,
        question: "How do I report an issue with a Session?",
        answer: "If you experience any problems during a session, go to 'My Sessions,' select the session in question, and click 'Report Issue.' Describe the problem and our support team will review it within 24 hours and take appropriate action."
    }
]

export default function FAQPage() {
    const [scrolled, setScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [openId, setOpenId] = useState<number | null>(null)

    // Navbar Scroll Effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const toggleFaq = (id: number) => {
        setOpenId(openId === id ? null : id)
    }

    const filteredFaqs = faqs.filter(faq => {
        const query = searchQuery.toLowerCase().trim()
        if (!query) return true
        return faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query)
    })

    return (
        <div style={{ backgroundColor: "#f0f4f5", minHeight: "100vh" }}>
            {/* Navigation (Matches Landing & About) */}
            <nav className={`navbar ${scrolled ? "scrolled" : ""}`} id="navbar">
                <div className="nav-container">
                    <Link href="/" className="logo">
                        <span className="logo-campus">Campus</span>{" "}
                        <span className="logo-helper">Helper</span>
                    </Link>

                    <ul className={`nav-links ${mobileMenuOpen ? "active" : ""}`} id="nav-links">
                        <li><Link href="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Home</Link></li>
                        <li><Link href="/about" className="nav-link" onClick={() => setMobileMenuOpen(false)}>About Us</Link></li>
                        <li><Link href="/faq" className="nav-link nav-link-active" onClick={() => setMobileMenuOpen(false)}>FAQ</Link></li>
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

            <main>
                {/* FAQ Hero Section */}
                <section className="faq-hero" id="faq-hero" style={{ paddingTop: '100px', display: 'flex', justifyContent: 'center', paddingBottom: '4rem' }}>
                    <div className="faq-hero-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3rem', maxWidth: '1000px', width: '100%', padding: '0 2rem', flexWrap: 'wrap' }}>
                        
                        <div className="faq-search-area" style={{ flex: '1 1 350px', background: 'white', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 12px 32px rgba(0,50,73,0.06)' }}>
                            <h1 style={{ fontSize: '2rem', color: '#003249', marginBottom: '1.5rem', fontWeight: 800 }}>How can we help?</h1>
                            <div className="faq-search-box" style={{ display: 'flex', alignItems: 'center', background: '#f0f4f5', borderRadius: '12px', padding: '12px 16px', gap: '12px', border: '1px solid #ccdbdc', transition: 'box-shadow 0.2s ease', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5b8a9c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                                <input 
                                    type="text" 
                                    className="faq-search-input" 
                                    placeholder="Search FAQs" 
                                    style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '1rem', color: '#003249' }}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="faq-hero-image" style={{ flex: '1 1 300px', display: 'flex', justifyContent: 'center' }}>
                            <Image src="/faq.svg" alt="FAQ illustration" width={340} height={280} style={{ maxWidth: '100%', height: 'auto', filter: 'drop-shadow(0 12px 24px rgba(0,50,73,0.1))' }} />
                        </div>

                    </div>
                </section>

                {/* FAQ Accordion Section */}
                <section className="faq-section" id="faq-section" style={{ padding: '0 2rem 5rem', display: 'flex', justifyContent: 'center' }}>
                    <div className="faq-container" style={{ maxWidth: '820px', width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        
                        {filteredFaqs.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: '#5b8a9c', background: 'white', borderRadius: '16px', border: '1px solid #ccdbdc' }}>
                                No results found for "{searchQuery}"
                            </div>
                        ) : (
                            filteredFaqs.map((faq) => {
                                const isOpen = openId === faq.id
                                return (
                                    <div 
                                        key={faq.id} 
                                        className={`faq-item ${isOpen ? 'active' : ''}`}
                                        style={{ 
                                            background: 'white', 
                                            borderRadius: '16px', 
                                            border: '1px solid #ccdbdc', 
                                            overflow: 'hidden',
                                            transition: 'all 0.3s ease',
                                            boxShadow: isOpen ? '0 8px 24px rgba(0,50,73,0.08)' : '0 2px 8px rgba(0,50,73,0.03)' 
                                        }}
                                    >
                                        <button 
                                            className="faq-question" 
                                            onClick={() => toggleFaq(faq.id)}
                                            style={{ 
                                                width: '100%', 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center', 
                                                padding: '1.25rem 1.5rem', 
                                                background: 'transparent', 
                                                border: 'none', 
                                                cursor: 'pointer',
                                                textAlign: 'left'
                                            }}
                                        >
                                            <span style={{ fontSize: '1.05rem', fontWeight: 600, color: isOpen ? '#007ea7' : '#003249', paddingRight: '1rem', transition: 'color 0.2s ease' }}>
                                                {faq.question}
                                            </span>
                                            <svg 
                                                xmlns="http://www.w3.org/2000/svg" 
                                                width="22" 
                                                height="22" 
                                                viewBox="0 0 24 24" 
                                                fill="none" 
                                                stroke={isOpen ? '#007ea7' : '#5b8a9c'} 
                                                strokeWidth="2.5" 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round"
                                                style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', flexShrink: 0 }}
                                            >
                                                <polyline points="6 9 12 15 18 9"></polyline>
                                            </svg>
                                        </button>
                                        
                                        <div 
                                            className="faq-answer" 
                                            style={{ 
                                                maxHeight: isOpen ? '300px' : '0', 
                                                opacity: isOpen ? 1 : 0, 
                                                overflow: 'hidden', 
                                                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                                                padding: isOpen ? '0 1.5rem 1.25rem' : '0 1.5rem',
                                                color: '#4a6a7c',
                                                lineHeight: 1.6,
                                                fontSize: '0.95rem'
                                            }}
                                        >
                                            <p>{faq.answer}</p>
                                        </div>
                                    </div>
                                )
                            })
                        )}

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
