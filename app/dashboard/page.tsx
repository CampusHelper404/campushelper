"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ClipboardList, Users, MessageSquare, CheckCircle, Search, PlusCircle } from "lucide-react"
import { trpc } from "@/trpc/client"
import ConsultantNavbar from "@/components/dashboard/ConsultantNavbar"
import "./dashboard.css"

export default function DashboardPage() {
    const [showAllRequests, setShowAllRequests] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const router = useRouter()

    // ── tRPC Data Fetching ───────────────────────────────────────────────────
    const { data: user, isLoading: isLoadingUser } = trpc.users.me.useQuery()
    const { data: requests, isLoading: isLoadingRequests } = trpc.helpRequests.list.useQuery({ studentId: user?.id }, { enabled: !!user?.id })
    const { data: sessions, isLoading: isLoadingSessions } = trpc.sessions.list.useQuery({ studentId: user?.id }, { enabled: !!user?.id })
    const { data: notifications } = trpc.notifications.list.useQuery({ unreadOnly: true })

    // ── Role-Based Redirect ──────────────────────────────────────────────────
    useEffect(() => {
        if (!isLoadingUser && user) {
            // /dashboard is the CONSULTANT view — redirect students to their dashboard
            if (!user.role || user.role === 'STUDENT') {
                router.push("/student-dashboard")
            }
        }
    }, [user, isLoadingUser, router])

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
    }

    const visibleRequests = showAllRequests ? requests : requests?.slice(0, 2)

    return (
        <div className="dash-wrapper">
            <ConsultantNavbar />

            <main className="dash-main">
                <div className="dash-welcome">
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-main)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                        Consultant Dashboard
                    </div>
                    <h1>Welcome Back, {user?.name?.split(" ")[0] || "User"}!</h1>
                    <p>Post requests, track your progress, and manage your help sessions.</p>
                </div>

                {/* Onboarding Alert */}
                {user && !user.onboarded && (
                    <div className="section-box" style={{ background: 'var(--accent-light)', border: '1px solid var(--accent-main)', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Finish Setting Up Your Profile</h3>
                                <p style={{ margin: '0.25rem 0 0', fontSize: '0.88rem', opacity: 0.8 }}>Complete your onboarding to unlock all features.</p>
                            </div>
                            <Link href="/onboarding" className="req-btn" style={{ padding: '0.5rem 1.25rem' }}>
                                Get Started
                            </Link>
                        </div>
                    </div>
                )}

                <div className="dash-stats">
                    <div className="stat-card">
                        <div className="stat-icon"><ClipboardList size={16} /></div>
                        <span className="stat-title">Open Requests</span>
                        <span className="stat-value">{requests?.filter(r => r.status === 'PENDING').length || 0}</span>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"><Users size={16} /></div>
                        <span className="stat-title">Consultants</span>
                        <span className="stat-value">0</span>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"><MessageSquare size={16} /></div>
                        <span className="stat-title">New Notifications</span>
                        <span className="stat-value">{notifications?.length || 0}</span>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"><CheckCircle size={16} /></div>
                        <span className="stat-title">Completed Sessions</span>
                        <span className="stat-value">{sessions?.filter(s => s.status === 'COMPLETED').length || 0}</span>
                    </div>
                </div>

                <div className="dash-grid">
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        <div className="section-box">
                            <h2 className="section-header">Quick Actions</h2>
                            <div className="quick-actions-grid">
                                <Link href="/student-requests" className="action-btn">
                                    <div className="action-icon-circle"><PlusCircle size={15} /></div>
                                    New Request
                                </Link>
                                <div className="action-btn" style={{ padding: '0.4rem 1rem', display: 'flex' }}>
                                    <div className="action-icon-circle"><Search size={15} /></div>
                                    <input type="text" placeholder="Find consultants" style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.88rem', color: 'var(--text-main)', fontWeight: 600 }} />
                                </div>
                            </div>
                        </div>

                        <div className="section-box light">
                            <h2 className="section-header">
                                Latest Requests
                                <button onClick={() => setShowAllRequests(!showAllRequests)} className="view-all-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                    {showAllRequests ? "Show Less" : "View All"} →
                                </button>
                            </h2>
                            <div className="requests-list">
                                {isLoadingRequests ? <p>Loading requests...</p> : 
                                 visibleRequests?.length === 0 ? <p>No current requests found.</p> :
                                 visibleRequests?.map((r) => (
                                    <div className="request-item" key={r.id}>
                                        <div className="req-info-wrap">
                                            <div className="req-avatar">{r.student?.name ? getInitials(r.student.name) : "R"}</div>
                                            <div>
                                                <div className="req-name">{r.title}</div>
                                                <div className="req-course">{r.course?.name || "General Help"}</div>
                                            </div>
                                        </div>
                                        <div className="req-actions">
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.8 }}>{r.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="section-box">
                        <h2 className="section-header">
                            Upcoming Sessions
                            <Link href="/sessions" className="view-all-link">View All →</Link>
                        </h2>
                        <div className="sessions-list">
                            {isLoadingSessions ? <p>Loading sessions...</p> :
                             sessions?.filter(s => s.status === 'UPCOMING').length === 0 ? <p>No upcoming sessions found.</p> :
                             sessions?.filter(s => s.status === 'UPCOMING').map((s) => (
                                <div className="session-item" key={s.id}>
                                    <div className="session-info">
                                        <div className="session-avatar" style={{ background: '#e0eaec', color: '#007ea7' }}>
                                            {s.consultant?.name ? getInitials(s.consultant.name) : "C"}
                                        </div>
                                        <div>
                                            <div className="session-name">{s.consultant?.name}</div>
                                            <div className="session-course">{s.request?.course?.name || "General Help"}</div>
                                        </div>
                                    </div>
                                    <span className="session-time">{new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
