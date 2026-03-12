"use client"

import { trpc } from "@/trpc/client"
import Image from "next/image"
import { MessageSquare, CheckCircle, Search, HelpCircle, User } from "lucide-react"
import StudentNavbar from "@/components/dashboard/StudentNavbar"
import "../dashboard/dashboard.css"

export default function MyHelpRequestsPage() {
    const { data: user } = trpc.users.me.useQuery()
    const { data: requests, isLoading } = trpc.helpRequests.list.useQuery({ studentId: user?.id }, { enabled: !!user?.id })

    return (
        <div className="dash-wrapper" style={{ background: '#f0f4f5', minHeight: '100vh', paddingTop: '70px' }}>
            <StudentNavbar />

            <main className="dash-main" style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
                
                {/* Banner */}
                <section className="dash-welcome" style={{ 
                    background: '#9ad1d4', 
                    borderRadius: '12px', 
                    padding: '2.5rem', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '3rem'
                }}>
                    <div style={{ maxWidth: '450px' }}>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: '#003249' }}>My Help Requests</h1>
                        <p style={{ fontSize: '1.05rem', color: '#003249', marginTop: '0.75rem', opacity: 0.9 }}>
                            Track your active, approved, and completed assistant requests here.
                        </p>
                    </div>
                    <div style={{ position: 'relative', width: '380px', height: '180px' }}>
                        <Image 
                            src="/student dashboard.svg" 
                            alt="Requests illustration" 
                            fill 
                            style={{ objectFit: 'contain' }} 
                        />
                    </div>
                </section>

                {/* Requests Table Box */}
                <section style={{ background: '#ccdbdc', borderRadius: '12px', padding: '2.5rem' }}>
                    <div style={{ marginBottom: '1.5rem', paddingLeft: '1rem' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#003249', margin: 0 }}>Requests</h2>
                    </div>

                    <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: '#9ad1d4' }}>
                                <tr>
                                    <th style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: '#003249', fontSize: '0.95rem' }}>SUBJECT</th>
                                    <th style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: '#003249', fontSize: '0.95rem' }}>STATUS</th>
                                    <th style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: '#003249', fontSize: '0.95rem' }}>CONSULTANT</th>
                                    <th style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: '#003249', fontSize: '0.95rem', textAlign: 'center' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', opacity: 0.7 }}>Loading requests...</td>
                                    </tr>
                                ) : requests?.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', opacity: 0.7 }}>You haven't made any requests yet.</td>
                                    </tr>
                                ) : (
                                    requests?.map((r, idx) => (
                                        <tr key={r.id} style={{ background: idx % 2 === 0 ? '#fff' : '#f0f4f5', borderBottom: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: '#003249' }}>
                                                {r.title}
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: '#003249', fontSize: '0.85rem' }}>
                                                {r.status}
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                {r.acceptedBy ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#003249', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                            <User size={24} />
                                                        </div>
                                                        <span style={{ fontWeight: 600, color: '#003249' }}>{r.acceptedBy.name}</span>
                                                    </div>
                                                ) : (
                                                    <span style={{ opacity: 0.5 }}>Not assigned</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                                                {r.status === 'PENDING' && (
                                                    <button style={{ 
                                                        background: '#003249', 
                                                        color: '#fff', 
                                                        border: 'none', 
                                                        padding: '8px 20px', 
                                                        borderRadius: '8px', 
                                                        fontWeight: 600, 
                                                        fontSize: '0.9rem',
                                                        cursor: 'pointer'
                                                    }}>
                                                        Cancel request
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    )
}
