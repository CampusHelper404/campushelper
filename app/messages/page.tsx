"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { trpc } from "@/trpc/client"
import StudentNavbar from "@/components/dashboard/StudentNavbar"
import HelperNavbar from "@/components/dashboard/HelperNavbar"
import AdminNavbar from "@/components/dashboard/AdminNavbar"
import { Search, Send, User, MessageCircle, MoreHorizontal, Loader2 } from "lucide-react"
import Image from "next/image"

function MessagesContent() {
    const searchParams = useSearchParams()
    const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(searchParams.get("userId"))
    const [messageInput, setMessageInput] = useState("")
    const scrollRef = useRef<HTMLDivElement>(null)

    // Current User to determine which Navbar to show
    const { data: user } = trpc.users.me.useQuery()

    // Fetch unique conversations
    const { data: conversations, isLoading: isLoadingConvos } = trpc.messages.listConversations.useQuery(undefined, {
        refetchInterval: 5000 
    })
    
    // Fetch messages for active chat
    const { data: messages, isLoading: isLoadingMessages } = trpc.messages.list.useQuery(
        { partnerId: selectedPartnerId ?? undefined },
        { enabled: !!selectedPartnerId, refetchInterval: 3000 }
    )

    const sendMessage = trpc.messages.send.useMutation({
        onSuccess: () => {
            setMessageInput("")
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

    const getInitials = (name: string) => {
        if (!name) return "U"
        return name.split(" ").map(n => n[0]).join("").toUpperCase()
    }

    return (
        <div className="dash-wrapper" style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
            {user?.role === 'ADMIN' ? <AdminNavbar /> : user?.role === 'HELPER' ? <HelperNavbar /> : <StudentNavbar />}
            
            <main style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                
                {/* Conversation Sidebar */}
                <div style={{ 
                    width: '380px', 
                    borderRight: '1px solid #e2e8f0', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    background: '#fff',
                    boxShadow: '4px 0 10px rgba(0,0,0,0.02)'
                }}>
                    <div style={{ padding: '1.25rem 1.25rem' }}>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#003249', marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>Messages</h2>
                        <div style={{ position: 'relative' }}>
                            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
                            <input 
                                type="text" 
                                placeholder="Search or start new chat" 
                                style={{ 
                                    width: '100%', 
                                    padding: '0.75rem 1rem 0.75rem 2.5rem', 
                                    borderRadius: '12px', 
                                    border: '1px solid #e2e8f0', 
                                    background: '#f8fafc',
                                    outline: 'none',
                                    fontSize: '0.82rem',
                                    transition: 'all 0.2s'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '0 0.5rem' }}>
                        {isLoadingConvos ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                                <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto 1rem' }} />
                                Loading conversations...
                            </div>
                        ) : conversations?.length === 0 ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                                <MessageCircle size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                <p style={{ fontSize: '0.9rem' }}>No messages yet.</p>
                            </div>
                        ) : conversations?.map((convo: any) => {
                            const isActive = selectedPartnerId === convo.partner.id
                            return (
                                <div 
                                    key={convo.partner.id}
                                    onClick={() => setSelectedPartnerId(convo.partner.id)}
                                    style={{ 
                                        padding: '1.25rem', 
                                        margin: '0.25rem 0',
                                        borderRadius: '16px',
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '1rem', 
                                        cursor: 'pointer',
                                        background: isActive ? '#f1f5f9' : 'transparent',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ 
                                        width: '52px', 
                                        height: '52px', 
                                        borderRadius: '50%', 
                                        background: isActive ? '#007ea7' : '#003249', 
                                        color: '#fff', 
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
                                            <span style={{ fontWeight: 800, color: '#003249', fontSize: '0.88rem' }}>{convo.partner.name}</span>
                                            <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>
                                                {new Date(convo.lastMessage.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {convo.lastMessage.senderId === convo.partner.id ? "" : <span style={{ fontWeight: 600 }}>You: </span>}
                                            {convo.lastMessage.content}
                                        </p>
                                    </div>
                                    {isActive && <div style={{ width: '4px', height: '40px', background: '#007ea7', borderRadius: '4px' }} />}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Chat Area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    
                    {selectedPartnerId ? (
                        <>
                            {/* Active Chat Header */}
                            <div style={{ 
                                padding: '1rem 2.5rem', 
                                background: 'rgba(255,255,255,0.8)', 
                                backdropFilter: 'blur(10px)',
                                borderBottom: '1px solid #e2e8f0', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                zIndex: 10
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#ccdbdc', color: '#007ea7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                                        {getInitials(conversations?.find((c: any) => c.partner.id === selectedPartnerId)?.partner.name || "U")}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 900, color: '#003249', fontSize: '1rem' }}>
                                            {conversations?.find((c: any) => c.partner.id === selectedPartnerId)?.partner.name}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                                            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981' }} /> Online
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button style={{ background: '#f1f5f9', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer', color: '#64748b' }}><Search size={20} /></button>
                                    <button style={{ background: '#f1f5f9', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer', color: '#64748b' }}><MoreHorizontal size={20} /></button>
                                </div>
                            </div>

                            {/* Messages List */}
                            <div 
                                ref={scrollRef}
                                style={{ 
                                    flex: 1, 
                                    padding: '2.5rem', 
                                    overflowY: 'auto', 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    gap: '1.25rem',
                                    scrollBehavior: 'smooth'
                                }}
                            >
                                {isLoadingMessages ? (
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Loader2 className="animate-spin" color="#007ea7" size={32} />
                                    </div>
                                ) : messages?.map((msg: any) => {
                                    const isMine = msg.senderId !== selectedPartnerId
                                    return (
                                        <div 
                                            key={msg.id}
                                            style={{ 
                                                alignSelf: isMine ? 'flex-end' : 'flex-start',
                                                maxWidth: '65%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '4px'
                                            }}
                                        >
                                            <div style={{ 
                                                padding: '0.75rem 1rem',
                                                borderRadius: isMine ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                                                background: isMine ? '#007ea7' : '#fff',
                                                color: isMine ? '#fff' : '#003249',
                                                boxShadow: '0 6px 12px -3px rgba(0,0,0,0.05)',
                                                border: isMine ? 'none' : '1px solid #e2e8f0',
                                                fontSize: '0.88rem',
                                                lineHeight: 1.5,
                                                fontWeight: 500
                                            }}>
                                                {msg.content}
                                            </div>
                                            <span style={{ 
                                                fontSize: '0.65rem', 
                                                color: '#94a3b8', 
                                                textAlign: isMine ? 'right' : 'left',
                                                fontWeight: 700,
                                                padding: '0 4px'
                                            }}>
                                                {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Input Footer */}
                            <form 
                                onSubmit={handleSendMessage}
                                style={{ padding: '2rem 2.5rem', background: '#fff', borderTop: '1px solid #e2e8f0' }}
                            >
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '1.5rem', 
                                    background: '#f8fafc', 
                                    padding: '0.6rem 0.6rem 0.6rem 1.5rem', 
                                    borderRadius: '18px', 
                                    border: '1px solid #e2e8f0',
                                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                                }}>
                                    <input 
                                        type="text" 
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        placeholder="Type your message here..." 
                                        style={{ 
                                            flex: 1, 
                                            background: 'none', 
                                            border: 'none', 
                                            outline: 'none', 
                                            color: '#003249', 
                                            fontSize: '0.9rem',
                                            fontWeight: 500
                                        }}
                                    />
                                    <button 
                                        type="submit"
                                        disabled={!messageInput.trim()}
                                        style={{ 
                                            background: !messageInput.trim() ? '#cbd5e1' : '#007ea7', 
                                            color: '#fff', 
                                            border: 'none', 
                                            borderRadius: '10px', 
                                            padding: '10px 20px',
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '6px',
                                            cursor: !messageInput.trim() ? 'not-allowed' : 'pointer',
                                            fontWeight: 800,
                                            transition: 'all 0.2s',
                                            boxShadow: !messageInput.trim() ? 'none' : '0 10px 15px -3px rgba(0, 126, 167, 0.4)',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        Send <Send size={16} />
                                    </button>
                                </div>
                            </form>
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
                                    <MessageCircle size={180} color="#f1f5f9" />
                                </div>
                            </div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 950, color: '#003249', marginBottom: '1rem', letterSpacing: '-0.04em' }}>
                                Your <span style={{ color: '#007ea7' }}>Inbox</span>
                            </h2>
                            <p style={{ color: '#64748b', textAlign: 'center', maxWidth: '450px', fontSize: '1.15rem', lineHeight: 1.6, fontWeight: 500 }}>
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
                    background: #e2e8f0;
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
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                <Loader2 className="animate-spin" color="#007ea7" size={32} />
            </div>
        }>
            <MessagesContent />
        </Suspense>
    )
}
