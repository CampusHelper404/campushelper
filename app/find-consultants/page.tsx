"use client"

import { useState } from "react"
import { trpc } from "@/trpc/client"
import StudentNavbar from "@/components/dashboard/StudentNavbar"
import Link from "next/link"
import Image from "next/image"
import { MessageSquare, CheckCircle, Search, HelpCircle, User } from "lucide-react"
import "../dashboard/dashboard.css"

export default function FindConsultantsPage() {
    const [searchQuery, setSearchQuery] = useState("")
    
    // Fetch helpers from backend
    const { data: helpers, isLoading } = trpc.helpers.list.useQuery()

    const filteredHelpers = helpers?.filter(h => 
        h.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.expertise.some(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    return (
        <div className="dash-wrapper" style={{ background: '#f0f4f5', minHeight: '100vh', paddingTop: '70px' }}>
            <StudentNavbar />

            <main className="dash-main" style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
                
                {/* Find Consultants Banner */}
                <section className="dash-welcome" style={{ 
                    background: '#9ad1d4', 
                    borderRadius: '12px', 
                    padding: '2.5rem', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '2rem'
                }}>
                    <div style={{ maxWidth: '500px' }}>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: '#003249' }}>Find Consultants</h1>
                        <p style={{ fontSize: '1.05rem', color: '#003249', marginTop: '0.75rem', opacity: 0.9 }}>
                            Find and connect with expert student consultants across all subjects
                        </p>
                    </div>
                    <div style={{ position: 'relative', width: '350px', height: '180px' }}>
                        <Image 
                            src="/find consultant.svg" 
                            alt="Consulting illustration" 
                            fill 
                            style={{ objectFit: 'contain' }} 
                        />
                    </div>
                </section>

                {/* Search Bar */}
                <section style={{ marginBottom: '2.5rem' }}>
                    <div style={{ position: 'relative', maxWidth: '350px' }}>
                        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} size={20} />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="search by subject" 
                            style={{ 
                                width: '100%', 
                                padding: '12px 12px 12px 42px', 
                                borderRadius: '8px', 
                                border: 'none', 
                                background: '#d9dee1', 
                                outline: 'none',
                                fontSize: '1rem',
                                color: '#003249'
                            }}
                        />
                    </div>
                </section>

                {/* Consultant Cards Grid */}
                <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                    {isLoading ? (
                        <p style={{ gridColumn: '1 / -1', textAlign: 'center' }}>Loading consultants...</p>
                    ) : filteredHelpers?.length === 0 ? (
                        <p style={{ gridColumn: '1 / -1', textAlign: 'center' }}>No consultants found matching your search.</p>
                    ) : (
                        filteredHelpers?.map((h) => (
                            <div key={h.id} style={{ 
                                background: '#ccdbdc', 
                                padding: '1.75rem', 
                                borderRadius: '14px', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center', 
                                gap: '1rem',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                            }}>
                                <div style={{ 
                                    width: '64px', 
                                    height: '64px', 
                                    borderRadius: '50%', 
                                    background: '#003249', 
                                    color: '#fff',
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    overflow: 'hidden'
                                }}>
                                    <User size={40} />
                                </div>
                                
                                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#003249' }}>
                                    {h.user.name}
                                </span>
                                
                                <p style={{ fontSize: '1rem', color: '#003249', opacity: 0.8, fontWeight: 500, margin: 0 }}>
                                    {h.expertise.map(e => e.name).join(", ") || "General Tutor"}
                                </p>
                                
                                <Link 
                                    href={`/consultants/${h.id}`} 
                                    style={{ 
                                        background: '#003249', 
                                        color: '#fff', 
                                        padding: '12px 0', 
                                        borderRadius: '8px', 
                                        fontSize: '1rem', 
                                        fontWeight: 600, 
                                        marginTop: '0.5rem',
                                        width: '100%',
                                        textAlign: 'center',
                                        textDecoration: 'none'
                                    }}
                                >
                                    View Profile
                                </Link>
                            </div>
                        ))
                    )}
                </section>
            </main>
        </div>
    )
}
