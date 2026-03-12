"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { trpc } from "@/trpc/client"
import StudentNavbar from "@/components/dashboard/StudentNavbar"
import { MessageSquare, CheckCircle, Search, HelpCircle, User } from "lucide-react"
import "../dashboard/dashboard.css"

export default function StudentDashboardPage() {
    const [showAllRequests, setShowAllRequests] = useState(false)
    const router = useRouter()

    // ── tRPC Data Fetching ───────────────────────────────────────────────────
    const { data: user } = trpc.users.me.useQuery()
    const { data: requests, isLoading: isLoadingRequests } = trpc.helpRequests.list.useQuery({ studentId: user?.id }, { enabled: !!user?.id })
    const { data: sessions, isLoading: isLoadingSessions } = trpc.sessions.list.useQuery({ studentId: user?.id }, { enabled: !!user?.id })
    const { data: notifications } = trpc.notifications.list.useQuery({ unreadOnly: true })
    const { data: helpers } = trpc.helpers.list.useQuery()

    const openRequestsCount = requests?.filter(r => r.status === 'PENDING').length || 0
    const completedSessionsCount = sessions?.filter(s => s.status === 'COMPLETED').length || 0
    const unreadNotifCount = notifications?.length || 0
    const consultantCount = helpers?.filter(h => h.verificationStatus === 'APPROVED').length || helpers?.length || 0
    
    const visibleRequests = showAllRequests ? requests : requests?.slice(0, 2)

    return (
        <div className="dash-wrapper" style={{ background: '#f0f4f5', minHeight: '100vh', paddingTop: '70px' }}>
            <StudentNavbar />

            <main className="dash-main" style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
                
                {/* Welcome Banner */}
                <section className="dash-welcome" style={{ 
                    background: '#9ad1d4', 
                    borderRadius: '12px', 
                    padding: '2.5rem', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '2rem',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ maxWidth: '450px', zIndex: 1 }}>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: '#003249' }}>
                            Welcome Back, {user?.name?.split(" ")[0] || "User"}!
                        </h1>
                        <p style={{ fontSize: '1.05rem', color: '#003249', marginTop: '0.75rem', opacity: 0.9 }}>
                            Post requests, track your progress, and manage your help sessions.
                        </p>
                    </div>
                    <div style={{ position: 'relative', width: '380px', height: '180px' }}>
                        <Image 
                            src="/user dashboard.svg" 
                            alt="Dashboard Illustration" 
                            fill 
                            style={{ objectFit: 'contain' }} 
                        />
                    </div>
                </section>

                {/* Stats Row */}
                <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
                    <div style={{ background: '#9ad1d4', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#003249', marginBottom: '0.5rem' }}>Open Requests</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#003249' }}>{openRequestsCount}</div>
                    </div>
                    <div style={{ background: '#9ad1d4', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#003249', marginBottom: '0.5rem' }}>Consultants</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#003249' }}>{consultantCount}</div>
                    </div>
                    <div style={{ background: '#9ad1d4', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', position: 'relative' }}>
                        <MessageSquare size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#003249' }} />
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#003249', marginBottom: '0.5rem' }}>New Messages</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#003249' }}>{unreadNotifCount}</div>
                    </div>
                    <div style={{ background: '#9ad1d4', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', position: 'relative' }}>
                        <CheckCircle size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#003249' }} />
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#003249', marginBottom: '0.5rem' }}>Completed Sessions</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#003249' }}>{completedSessionsCount}</div>
                    </div>
                </section>

                {/* Middle Row: Quick Actions + Upcoming Sessions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
                    
                    {/* Quick Actions */}
                    <div style={{ background: '#ccdbdc', borderRadius: '12px', padding: '1.5rem' }}>
                        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: '#003249' }}>Quick Actions</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <Link href="/my-requests" style={{ 
                                background: '#fff', 
                                padding: '1.25rem', 
                                borderRadius: '10px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '12px', 
                                textDecoration: 'none',
                                color: '#003249',
                                fontWeight: 600,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                            }}>
                                <HelpCircle size={32} />
                                <span>New Request</span>
                            </Link>
                            <Link href="/find-consultants" style={{ 
                                background: '#fff', 
                                padding: '1.25rem', 
                                borderRadius: '10px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '12px', 
                                textDecoration: 'none',
                                color: '#003249',
                                fontWeight: 600,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                            }}>
                                <Search size={32} />
                                <span>Find consultants</span>
                            </Link>
                        </div>
                    </div>

                    {/* Upcoming Sessions */}
                    <div style={{ background: '#ccdbdc', borderRadius: '12px', padding: '1.5rem' }}>
                        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: '#003249' }}>Upcoming Sessions</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {sessions?.filter(s => s.status === 'UPCOMING').length === 0 ? (
                                <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>No upcoming sessions.</p>
                            ) : (
                                sessions?.filter(s => s.status === 'UPCOMING').map(s => (
                                    <div key={s.id} style={{ 
                                        background: '#fff', 
                                        padding: '1rem', 
                                        borderRadius: '10px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#003249', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                <User size={24} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{s.consultant?.name || "Consultant"}</div>
                                                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{s.request?.course?.name || "General Help"}</div>
                                            </div>
                                        </div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                            {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Latest Requests */}
                <section style={{ background: '#ccdbdc', borderRadius: '12px', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#003249' }}>Latest Requests</h2>
                        <Link href="/my-requests" style={{ color: '#007ea7', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
                            View All Requests ›
                        </Link>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {visibleRequests?.map(r => (
                            <div key={r.id} style={{ 
                                background: '#fff', 
                                padding: '1rem 1.5rem', 
                                borderRadius: '10px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#003249', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <User size={30} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '1rem' }}>{r.title}</div>
                                        <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{r.course?.name || "General Help"}</div>
                                    </div>
                                </div>
                                <div style={{ 
                                    background: r.status === 'ACCEPTED' ? '#007ea7' : '#007ea7', // The mockup shows teal for both mostly
                                    color: '#fff',
                                    padding: '6px 20px',
                                    borderRadius: '4px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    width: '120px',
                                    textAlign: 'center'
                                }}>
                                    {r.status === 'ACCEPTED' ? 'Approved' : 'Pending'}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </main>
        </div>
    )
}
