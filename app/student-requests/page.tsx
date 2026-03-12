"use client"

import { useState } from "react"
import Link from "next/link"
import { trpc } from "@/trpc/client"
import "../dashboard/dashboard.css"

export default function StudentRequestsPage() {
    const utils = trpc.useUtils()
    const { data: user } = trpc.users.me.useQuery()
    const { data: pendingRequests, isLoading } = trpc.helpRequests.list.useQuery({ status: 'PENDING' })
    
    const updateRequest = trpc.helpRequests.updateStatus.useMutation({
        onSuccess: () => {
            utils.helpRequests.list.invalidate()
        }
    })

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
    }

    const handleAction = async (requestId: string, status: 'ACCEPTED' | 'DECLINED') => {
        await updateRequest.mutateAsync({ id: requestId, status })
    }

    return (
        <div className="dash-wrapper">
            <nav className="dash-nav">
                <div className="dash-brand">
                    <span className="campus">Campus</span>
                    <span className="helper">Helper</span>
                </div>
                <ul className="dash-nav-links">
                    <li><Link href="/dashboard">Dashboard</Link></li>
                    <li><Link href="/student-requests" className="active">Student Requests</Link></li>
                    <li><Link href="/sessions">Sessions</Link></li>
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
                    <h1>Student Requests</h1>
                    <p>Review and accept incoming requests for your expertise</p>
                </div>

                {/* Role Guard: Show warning to students */}
                {user && user.role === 'STUDENT' && (
                    <div className="section-box" style={{ background: '#fff7ed', border: '1px solid #fb923c', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                        <strong>📌 This page is for Consultants.</strong>
                        <p style={{ margin: '0.5rem 0 0', opacity: 0.8 }}>You are viewing this page as a Student. Apply to become a Consultant to respond to requests.</p>
                    </div>
                )}

                <div className="section-box light" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                    <h2 className="section-header">Pending Requests</h2>
                    <div className="requests-list">
                        {isLoading ? <p>Loading requests...</p> : 
                         pendingRequests?.length === 0 ? <p>No pending requests at the moment.</p> :
                         pendingRequests?.map((r) => (
                            <div className="request-item" key={r.id} style={{ padding: '1rem 1.25rem' }}>
                                <div className="req-info-wrap">
                                    <div className="req-avatar">{r.student?.name ? getInitials(r.student.name) : "R"}</div>
                                    <div>
                                        <div className="req-name">{r.title}</div>
                                        <div className="req-course">{r.course?.name || "General Help"}</div>
                                        <div className="req-course" style={{ marginTop: '4px', opacity: 0.8 }}>
                                            {new Date(r.createdAt).toLocaleDateString()} • {r.preferredTime || "Anytime"}
                                        </div>
                                    </div>
                                </div>
                                <div className="req-actions">
                                    {user?.role === 'CONSULTANT' && (
                                        <>
                                            <button 
                                                className="req-btn" 
                                                onClick={() => handleAction(r.id, 'ACCEPTED')}
                                                disabled={updateRequest.isPending}
                                            >
                                                Accept
                                            </button>
                                            <button 
                                                className="req-btn decline" 
                                                onClick={() => handleAction(r.id, 'DECLINED')}
                                                disabled={updateRequest.isPending}
                                            >
                                                Decline
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}
