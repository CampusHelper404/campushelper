"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function TermsPage() {
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

    return (
        <div style={{ backgroundColor: "var(--background)", minHeight: "100vh" }}>
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

            <main style={{ paddingTop: '120px', paddingBottom: '5rem', display: 'flex', justifyContent: 'center' }}>
                <div style={{
                    maxWidth: '800px', width: '100%', margin: '0 1.5rem',
                    background: 'var(--card)', padding: '3rem 4rem', borderRadius: '24px',
                    boxShadow: '0 12px 32px color-mix(in srgb, var(--foreground) 6%, transparent)', border: '1px solid var(--secondary)'
                }}>
                    
                    <div style={{ marginBottom: '2.5rem', borderBottom: '2px solid var(--background)', paddingBottom: '2rem' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                            Legal
                        </div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--foreground)', marginBottom: '0.5rem', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                            Terms of Service
                        </h1>
                        <p style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>Last updated: January 14, 2026</p>
                    </div>

                    <div className="legal-content">
                        <h2>Overview</h2>
                        <p>
                            This website is operated by CampusHelper. Throughout the site,
                            the terms "we", "us" and "our" refer to CampusHelper. CampusHelper
                            offers this website, including all information, tools and
                            services available from this site to you, the user, conditioned upon
                            your acceptance of all terms, conditions, policies and notices stated
                            here.
                        </p>
                        <p>
                            By visiting our site and/or purchasing something from us, you engage in
                            our "Service" and agree to be bound by the following terms and
                            conditions ("Terms of Service", "Terms"), including those additional
                            terms and conditions and policies referenced herein and/or available by
                            hyperlink. These Terms of Service apply to all users of the site,
                            including without limitation users who are browsers, vendors, customers,
                            merchants, and/or contributors of content.
                        </p>
                        <p>
                            Please read these Terms of Service carefully before accessing or using
                            our website. By accessing or using any part of the site, you agree to be
                            bound by these Terms of Service. If you do not agree to all the terms
                            and conditions of this agreement, then you may not access the website or
                            use any services.
                        </p>

                        <h2>Section 1 - Online Store Terms</h2>
                        <p>
                            By agreeing to these Terms of Service, you represent that you are at
                            least the age of majority in your state or province of residence, or
                            that you are the age of majority in your state or province of residence
                            and you have given us your consent to allow any of your minor dependents
                            to use this site.
                        </p>
                        <p>
                            You may not use our products for any illegal or unauthorized purpose nor
                            may you, in the use of the Service, violate any laws in your jurisdiction.
                        </p>

                        <h2>Section 2 - General Conditions</h2>
                        <p>
                            We reserve the right to refuse service to anyone for any reason at any
                            time. You understand that your content (not including credit card
                            information), may be transferred unencrypted and involve (a)
                            transmissions over various networks; and (b) changes to conform and
                            adapt to technical requirements of connecting networks or devices.
                        </p>
                    </div>
                </div>
            </main>

            <style jsx>{`
                .legal-content h2 {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: var(--foreground);
                    margin-top: 2.5rem;
                    margin-bottom: 1rem;
                    letter-spacing: -0.02em;
                }
                .legal-content p {
                    font-size: 1.05rem;
                    line-height: 1.7;
                    color: var(--muted-foreground);
                    margin-bottom: 1.25rem;
                }
                .legal-content p:last-child {
                    margin-bottom: 0;
                }
                @media (max-width: 768px) {
                    main > div {
                        padding: 2rem !important;
                    }
                }
            `}</style>
        </div>
    )
}
