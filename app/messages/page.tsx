"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { trpc } from "@/trpc/client"
import StudentNavbar from "@/components/dashboard/StudentNavbar"
import HelperNavbar from "@/components/dashboard/HelperNavbar"
import AdminNavbar from "@/components/dashboard/AdminNavbar"
import { Search, Send, User, MessageCircle, MoreHorizontal, Loader2, ShieldCheck } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

function MessagesContent() {
    const searchParams = useSearchParams()
    const [isMobile, setIsMobile] = useState(false)
    const [showSidebar, setShowSidebar] = useState(true)
    const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(searchParams.get('userId'))
    const [messageInput, setMessageInput] = useState("")
    const scrollRef = useRef<HTMLDivElement>(null)

    // Handle initial mobile state and resizing
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth <= 768
            setIsMobile(mobile)
            // If we have a selected partner and enter mobile mode, hide sidebar
            if (mobile && selectedPartnerId) {
                setShowSidebar(false)
            }
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [selectedPartnerId])

    // When a partner is selected on mobile, hide the sidebar
    useEffect(() => {
        if (isMobile && selectedPartnerId) {
            setShowSidebar(false)
        }
    }, [selectedPartnerId, isMobile])

    // Current User to determine which Navbar to show
    const { data: user } = trpc.users.me.useQuery()
    const isHelper = user?.role === 'HELPER'

    // Fetch unique conversations
    const { data: conversations, isLoading: isLoadingConvos } = trpc.messages.listConversations.useQuery(undefined, {
        refetchInterval: 5000 
    })
    
    // Fetch messages for active chat
    const { data: messages, isLoading: isLoadingMessages } = trpc.messages.list.useQuery(
        { partnerId: selectedPartnerId ?? undefined },
        { enabled: !!selectedPartnerId, refetchInterval: 3000 }
    )

    // Check if messaging is unlocked
    const { data: partnerSessions } = trpc.sessions.list.useQuery(
        isHelper ? { helperId: user?.id, studentId: selectedPartnerId ?? undefined } : { studentId: user?.id, helperId: selectedPartnerId ?? undefined },
        { enabled: !!selectedPartnerId && !!user?.id }
    )

    const isUnlocked = user?.role === 'ADMIN' || partnerSessions?.some((s: any) => 
        s.payment?.status === 'HELD' || s.payment?.status === 'RELEASED'
    )

    const sendMessage = trpc.messages.send.useMutation({
        onSuccess: () => {
            setMessageInput("")
        }
    })

    const trpcContext = trpc.useUtils()
    
    const markAsRead = trpc.messages.markAsRead.useMutation({
        onSuccess: () => {
            trpcContext.messages.listConversations.invalidate()
            trpcContext.messages.list.invalidate()
        }
    })

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault()
        if (!messageInput.trim() || !selectedPartnerId) return
        sendMessage.mutate({
            recipientId: selectedPartnerId,
            content: messageInput
        })
    }

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    // Mark as read when viewing messages
    useEffect(() => {
        if (selectedPartnerId && messages) {
            const hasUnread = messages.some((m: any) => m.senderId === selectedPartnerId && !m.readAt)
            if (hasUnread) {
                markAsRead.mutate({ partnerId: selectedPartnerId })
            }
        }
    }, [messages, selectedPartnerId])

    const getInitials = (name: string) => {
        if (!name) return "U"
        return name.split(" ").map(n => n[0]).join("").toUpperCase()
    }

    return (
        <div className="dash-wrapper" style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--sidebar)' }}>
            {user?.role === 'ADMIN' ? <AdminNavbar /> : user?.role === 'HELPER' ? <HelperNavbar /> : <StudentNavbar />}
            
            <main className="ch-messages-container" style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
                
                {/* Conversation Sidebar */}
                <div className="ch-messages-sidebar" style={{ 
                    width: isMobile ? '100%' : '360px', 
                    borderRight: isMobile ? 'none' : '1px solid var(--muted)', 
                    display: (isMobile && !showSidebar) ? 'none' : 'flex', 
                    flexDirection: 'column', 
                    background: 'var(--card)',
                    boxShadow: '4px 0 10px rgba(0,0,0,0.02)',
                    zIndex: 20
                }}>
                    <div style={{ padding: '1.25rem 1.25rem' }}>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--foreground)', marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>Messages</h2>
                        <div style={{ position: 'relative' }}>
                            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} size={16} />
                            <input 
                                type="text" 
                                placeholder="Search or start new chat" 
                                style={{ 
                                    width: '100%', 
                                    padding: '0.75rem 1rem 0.75rem 2.5rem', 
                                    borderRadius: '12px', 
                                    border: '1px solid var(--muted)', 
                                    background: 'var(--sidebar)',
                                    outline: 'none',
                                    fontSize: '0.82rem',
                                    transition: 'all 0.2s'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '0 0.5rem' }}>
                        {isLoadingConvos ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                                <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto 1rem' }} />
                                Loading conversations...
                            </div>
                        ) : conversations?.length === 0 ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                                <MessageCircle size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                <p style={{ fontSize: '0.9rem' }}>No messages yet.</p>
                            </div>
                        ) : conversations?.map((convo: any) => {
                            const isActive = selectedPartnerId === convo.partner.id
                            return (
                                <div 
                                    key={convo.partner.id}
                                    onClick={() => {
                                        setSelectedPartnerId(convo.partner.id)
                                        if (isMobile) setShowSidebar(false)
                                    }}
                                    style={{ 
                                        padding: '1.25rem', 
                                        margin: '0.25rem 0',
                                        borderRadius: '16px',
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '1rem', 
                                        cursor: 'pointer',
                                        background: isActive ? 'var(--muted)' : 'transparent',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ 
                                        width: '52px', 
                                        height: '52px', 
                                        borderRadius: '50%', 
                                        background: isActive ? 'var(--primary)' : 'var(--foreground)', 
                                        color: 'var(--card)', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        fontWeight: 800,
                                        fontSize: '1.1rem',
                                        flexShrink: 0,
                                        transition: 'all 0.3s'
                                    }}>
                                        {getInitials(convo.partner.name)}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                                            <span style={{ fontWeight: convo.unreadCount > 0 ? 900 : 800, color: 'var(--foreground)', fontSize: '0.88rem' }}>{convo.partner.name}</span>
                                            <span style={{ fontSize: '0.7rem', color: convo.unreadCount > 0 ? 'var(--primary)' : 'var(--muted-foreground)', fontWeight: convo.unreadCount > 0 ? 800 : 600 }}>
                                                {new Date(convo.lastMessage.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <p style={{ margin: 0, fontSize: '0.78rem', color: convo.unreadCount > 0 ? 'var(--foreground)' : 'var(--muted-foreground)', fontWeight: convo.unreadCount > 0 ? 700 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                                                {convo.lastMessage.senderId === convo.partner.id ? "" : <span style={{ fontWeight: 600 }}>You: </span>}
                                                {convo.lastMessage.content}
                                            </p>
                                            {convo.unreadCount > 0 && (
                                                <div style={{
                                                    background: 'var(--destructive)',
                                                    color: 'white',
                                                    fontSize: '0.65rem',
                                                    fontWeight: 800,
                                                    padding: '2px 6px',
                                                    borderRadius: '10px',
                                                    marginLeft: '8px'
                                                }}>
                                                    {convo.unreadCount}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {!isMobile && isActive && <div style={{ width: '4px', height: '40px', background: 'var(--primary)', borderRadius: '4px' }} />}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Chat Area */}
                <div style={{ 
                    flex: 1, 
                    display: (isMobile && showSidebar) ? 'none' : 'flex', 
                    flexDirection: 'column', 
                    position: 'relative',
                    background: 'var(--background)'
                }}>
                    
                    {selectedPartnerId ? (
                        <>
                            {/* Active Chat Header */}
                            <div style={{ 
                                padding: isMobile ? '0.75rem 1rem' : '1rem 2.5rem', 
                                background: 'color-mix(in srgb, var(--card) 80%, transparent)', 
                                backdropFilter: 'blur(10px)',
                                borderBottom: '1px solid var(--muted)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                zIndex: 10
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.5rem' : '1rem' }}>
                                    {isMobile && (
                                        <button 
                                            onClick={() => setShowSidebar(true)}
                                            style={{ 
                                                background: 'none', 
                                                border: 'none', 
                                                padding: '8px', 
                                                cursor: 'pointer', 
                                                color: 'var(--primary)',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <MoreHorizontal size={24} style={{ transform: 'rotate(180deg)' }} />
                                        </button>
                                    )}
                                    <div style={{ width: isMobile ? '36px' : '44px', height: isMobile ? '36px' : '44px', borderRadius: '50%', background: 'var(--secondary)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: isMobile ? '0.8rem' : '1rem' }}>
                                        {getInitials(conversations?.find((c: any) => c.partner.id === selectedPartnerId)?.partner.name || "U")}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 900, color: 'var(--foreground)', fontSize: isMobile ? '0.9rem' : '1rem' }}>
                                            {conversations?.find((c: any) => c.partner.id === selectedPartnerId)?.partner.name}
                                        </div>
                                        <div style={{ fontSize: '0.65rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#10b981' }} /> Online
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    {!isMobile && <button style={{ background: 'var(--muted)', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer', color: 'var(--muted-foreground)' }}><Search size={20} /></button>}
                                    <button style={{ background: 'var(--muted)', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer', color: 'var(--muted-foreground)' }}><MoreHorizontal size={20} /></button>
                                </div>
                            </div>

                            {/* Messages List */}
                            <div 
                                ref={scrollRef}
                                style={{ 
                                    flex: 1, 
                                    padding: isMobile ? '1.5rem 1rem' : '2.5rem', 
                                    overflowY: 'auto', 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    gap: '1rem',
                                    scrollBehavior: 'smooth'
                                }}
                            >
                                {isLoadingMessages ? (
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Loader2 className="animate-spin" color="var(--primary)" size={32} />
                                    </div>
                                ) : messages?.map((msg: any, index: number) => {
                                    const isMine = msg.senderId !== selectedPartnerId
                                    const isLastMessage = index === messages.length - 1
                                    return (
                                        <div 
                                            key={msg.id}
                                            style={{ 
                                                alignSelf: isMine ? 'flex-end' : 'flex-start',
                                                maxWidth: isMobile ? '85%' : '65%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '4px'
                                            }}
                                        >
                                            <div style={{ 
                                                padding: '0.75rem 1rem',
                                                borderRadius: isMine ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                                                background: isMine ? 'var(--primary)' : 'var(--card)',
                                                color: isMine ? 'var(--card)' : 'var(--foreground)',
                                                boxShadow: '0 6px 12px -3px rgba(0,0,0,0.05)',
                                                border: isMine ? 'none' : '1px solid var(--muted)',
                                                fontSize: isMobile ? '0.82rem' : '0.88rem',
                                                lineHeight: 1.5,
                                                fontWeight: 500
                                            }}>
                                                {msg.content}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', alignItems: 'center', gap: '4px' }}>
                                                <span style={{ 
                                                    fontSize: '0.65rem', 
                                                    color: 'var(--muted-foreground)', 
                                                    fontWeight: 700,
                                                    padding: '0 4px'
                                                }}>
                                                    {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {isMine && msg.readAt && isLastMessage && (
                                                    <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 800 }}>✓ Read</span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Input Footer */}
                            {!isUnlocked ? (
                                <div style={{ 
                                    padding: '2rem', 
                                    background: 'color-mix(in srgb, var(--primary) 5%, var(--card))', 
                                    borderTop: '1px solid var(--muted)',
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <ShieldCheck size={32} style={{ color: 'var(--primary)', opacity: 0.8 }} />
                                    <div style={{ fontWeight: 800, color: 'var(--foreground)', fontSize: '0.95rem' }}>Messaging Locked</div>
                                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.82rem', maxWidth: '400px', margin: 0, lineHeight: 1.5 }}>
                                        To protect our community, messaging is only unlocked once a session has been secured with payment.
                                    </p>
                                    {!isHelper && (
                                        <Link href="/sessions" style={{ 
                                            marginTop: '8px',
                                            background: 'var(--primary)', color: 'white', padding: '10px 20px', 
                                            borderRadius: 'var(--radius-pill)', fontWeight: 800, textDecoration: 'none',
                                            fontSize: '0.8rem', boxShadow: 'var(--shadow-glow)'
                                        }}>
                                            View Sessions to Pay
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <form 
                                    onSubmit={handleSendMessage}
                                    style={{ padding: isMobile ? '1rem' : '2rem 2.5rem', background: 'var(--card)', borderTop: '1px solid var(--muted)' }}
                                >
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: isMobile ? '0.75rem' : '1.5rem', 
                                        background: 'var(--sidebar)', 
                                        padding: '0.5rem 0.5rem 0.5rem 1.25rem', 
                                        borderRadius: '18px', 
                                        border: '1px solid var(--muted)',
                                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                                    }}>
                                        <input 
                                            type="text" 
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            placeholder="Type your message..." 
                                            style={{ 
                                                flex: 1, 
                                                background: 'none', 
                                                border: 'none', 
                                                outline: 'none', 
                                                color: 'var(--foreground)', 
                                                fontSize: '0.85rem',
                                                fontWeight: 500
                                            }}
                                        />
                                        <button 
                                            type="submit"
                                            disabled={!messageInput.trim() || (sendMessage as any).isLoading}
                                            style={{ 
                                                background: !messageInput.trim() ? '#cbd5e1' : 'var(--primary)', 
                                                color: 'var(--card)', 
                                                border: 'none', 
                                                borderRadius: '12px', 
                                                padding: isMobile ? '8px 16px' : '10px 20px',
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '6px',
                                                cursor: !messageInput.trim() ? 'not-allowed' : 'pointer',
                                                fontWeight: 800,
                                                transition: 'all 0.2s',
                                                boxShadow: !messageInput.trim() ? 'none' : '0 10px 15px -3px color-mix(in srgb, var(--primary) 40%, transparent)',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            {(sendMessage as any).isLoading ? '...' : <Send size={16} />}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </>
                    ) : (
                        /* Empty State Placeholder */
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
                            <div style={{ 
                                position: 'relative', 
                                width: '400px', 
                                height: '350px',
                                marginBottom: '2.5rem',
                                animation: 'pulse 3s infinite ease-in-out'
                            }}>
                                <Image 
                                    src="/messages-empty.png" 
                                    alt="Messaging" 
                                    fill 
                                    style={{ objectFit: 'contain', opacity: 0.9 }} 
                                />
                                <div style={{ 
                                    position: 'absolute', 
                                    top: '50%', 
                                    left: '50%', 
                                    transform: 'translate(-50%, -50%)',
                                    zIndex: -1
                                }}>
                                    <MessageCircle size={180} color="var(--muted)" />
                                </div>
                            </div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--foreground)', marginBottom: '1rem', letterSpacing: '-0.04em' }}>
                                Your <span style={{ color: 'var(--primary)' }}>Inbox</span>
                            </h2>
                            <p style={{ color: 'var(--muted-foreground)', textAlign: 'center', maxWidth: '450px', fontSize: '1.15rem', lineHeight: 1.6, fontWeight: 500 }}>
                                Select a helper or student from the sidebar to start a conversation and get help.
                            </p>
                        </div>
                    )}
                </div>
            </main>
            <style jsx>{`
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                    100% { transform: scale(1); }
                }
                ::-webkit-scrollbar {
                    width: 6px;
                }
                ::-webkit-scrollbar-track {
                    background: transparent;
                }
                ::-webkit-scrollbar-thumb {
                    background: var(--muted);
                    border-radius: 10px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    )
}

export default function MessagesPage() {
    return (
        <Suspense fallback={
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--sidebar)' }}>
                <Loader2 className="animate-spin" color="var(--primary)" size={32} />
            </div>
        }>
            <MessagesContent />
        </Suspense>
    )
}
