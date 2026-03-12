"use client"

import Link from "next/link"
import { trpc } from "@/trpc/client"
import "../dashboard/dashboard.css"

export default function SessionsPage() {
    const { data: user } = trpc.users.me.useQuery()
    const isConsultant = user?.role === 'CONSULTANT'
    // Fetch sessions filtered by the correct role
    const { data: sessions, isLoading } = trpc.sessions.list.useQuery(
        isConsultant ? { consultantId: user?.id } : { studentId: user?.id },
        { enabled: !!user?.id }
    )

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
    }

    const upcomingSessions = sessions?.filter(s => s.status === 'UPCOMING') || []
    const completedSessions = sessions?.filter(s => s.status === 'COMPLETED') || []

    return (
        <div className="dash-wrapper">
            <nav className="dash-nav">
                <div className="dash-brand">
                    <span className="campus">Campus</span>
                    <span className="helper">Helper</span>
                </div>
                <ul className="dash-nav-links">
                    <li><Link href="/dashboard">Dashboard</Link></li>
                    <li><Link href="/student-requests">Student Requests</Link></li>
                    <li><Link href="/sessions" className="active">Sessions</Link></li>
                    <li><Link href="#">Messages</Link></li>
                    <li><Link href="#">Settings</Link></li>
                    <li>
                        <div className="dash-avatar">
                            {user?.name ? getInitials(user.name) : "U"}
                        </div>
                    </li>
                </ul>
            </nav>

            <main className="dash-main">
                <div className="dash-welcome">
                    <h1>Your Sessions</h1>
                    <p>Manage your upcoming and past learning appointments</p>
                </div>

                <div className="dash-grid">
                    {/* Upcoming Sessions */}
                    <div className="section-box light">
                        <h2 className="section-header">Upcoming Sessions</h2>
                        <div className="sessions-list">
                            {isLoading ? <p>Loading sessions...</p> :
                             upcomingSessions.length === 0 ? <p>No upcoming sessions.</p> :
                             upcomingSessions.map((s) => (
                                <div className="session-item" key={s.id}>
                                    <div className="session-info">
                                        <div className="session-avatar">
                                            {s.consultant?.name ? getInitials(s.consultant.name) : "C"}
                                        </div>
                                        <div>
                                            <div className="session-name">{s.consultant?.name}</div>
                                            <div className="session-course">{s.request?.course?.name || "General Help"}</div>
                                        </div>
                                    </div>
                                    <span className="session-time">
                                        {new Date(s.startTime).toLocaleDateString()} • {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Completed Sessions */}
                    <div className="section-box">
                        <h2 className="section-header">Completed Sessions</h2>
                        <div className="sessions-list">
                            {isLoading ? <p>Loading sessions...</p> :
                             completedSessions.length === 0 ? <p>No completed sessions yet.</p> :
                             completedSessions.map((s) => (
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
                                    <span className="session-time" style={{ color: '#4a6a7c' }}>
                                        {new Date(s.startTime).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
