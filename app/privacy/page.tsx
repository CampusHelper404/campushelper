"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function PrivacyPage() {
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
                            Privacy Policy
                        </h1>
                        <p style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>Last updated: January 14, 2026</p>
                    </div>

                    <div className="legal-content">
                        <p>
                            This Privacy Policy describes Our policies and procedures on the
                            collection, use and disclosure of Your information when You use the
                            Service and tells You about Your privacy rights and how the law protects
                            You.
                        </p>
                        <p>
                            We use Your Personal data to provide and improve the Service. By using
                            the Service, You agree to the collection and use of information in
                            accordance with this Privacy Policy.
                        </p>

                        <h2>Interpretation and Definitions</h2>
                        <h3>Interpretation</h3>
                        <p>
                            The words of which the initial letter is capitalized have meanings
                            defined under the following conditions. The following definitions shall
                            have the same meaning regardless of whether they appear in singular or
                            in plural.
                        </p>

                        <h3>Definitions</h3>
                        <p>For the purposes of this Privacy Policy:</p>
                        <ul>
                            <li>
                                <strong>Account</strong> means a unique account created for You to
                                access our Service or parts of our Service.
                            </li>
                            <li>
                                <strong>Company</strong> (referred to as either "the Company", "We",
                                "Us" or "Our" in this Agreement) refers to CampusHelper.
                            </li>
                            <li>
                                <strong>Cookies</strong> are small files that are placed on Your
                                computer, mobile device or any other device by a website, containing
                                the details of Your browsing history on that website among its many
                                uses.
                            </li>
                            <li>
                                <strong>Device</strong> means any device that can access the Service
                                such as a computer, a cellphone or a digital tablet.
                            </li>
                            <li>
                                <strong>Personal Data</strong> is any information that relates to an
                                identified or identifiable individual.
                            </li>
                        </ul>

                        <h2>Collecting and Using Your Personal Data</h2>
                        <h3>Types of Data Collected</h3>
                        <h4>Personal Data</h4>
                        <p>
                            While using Our Service, We may ask You to provide Us with certain
                            personally identifiable information that can be used to contact or
                            identify You. Personally identifiable information may include, but is not
                            limited to:
                        </p>
                        <ul>
                            <li>Email address</li>
                            <li>First name and last name</li>
                            <li>Usage Data</li>
                        </ul>

                        <h2>Security of Your Personal Data</h2>
                        <p>
                            The security of Your Personal Data is important to Us, but remember that
                            no method of transmission over the Internet, or method of electronic
                            storage is 100% secure. While We strive to use commercially acceptable
                            means to protect Your Personal Data, We cannot guarantee its absolute
                            security.
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
                .legal-content h3 {
                    font-size: 1.15rem;
                    font-weight: 700;
                    color: var(--primary);
                    margin-top: 1.5rem;
                    margin-bottom: 0.75rem;
                }
                .legal-content h4 {
                    font-size: 1.05rem;
                    font-weight: 700;
                    color: var(--foreground);
                    margin-top: 1rem;
                    margin-bottom: 0.5rem;
                }
                .legal-content p {
                    font-size: 1.05rem;
                    line-height: 1.7;
                    color: var(--muted-foreground);
                    margin-bottom: 1.25rem;
                }
                .legal-content ul {
                    list-style-type: none;
                    margin-bottom: 1.5rem;
                    padding-left: 1rem;
                }
                .legal-content li {
                    font-size: 1.05rem;
                    line-height: 1.7;
                    color: var(--muted-foreground);
                    margin-bottom: 0.5rem;
                    position: relative;
                }
                .legal-content li::before {
                    content: "•";
                    color: var(--primary);
                    font-weight: bold;
                    display: inline-block;
                    width: 1em;
                    margin-left: -1em;
                }
                .legal-content strong {
                    color: var(--foreground);
                    font-weight: 700;
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
