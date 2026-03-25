"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { trpc } from "@/trpc/client"
import StudentNavbar from "@/components/dashboard/StudentNavbar"
import { HelperProfileModal } from "@/components/dashboard/HelperProfileModal"
import { Search, Star, BookOpen, MessageSquare, Users, MessageCircle, PlusCircle, ArrowUpRight, DollarSign, ShieldCheck } from "lucide-react"
import "../dashboard/dashboard.css"

export default function FindHelpersPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedHelperId, setSelectedHelperId] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const router = useRouter()
    
    const { data: user } = trpc.users.me.useQuery()
    const { data: helpers, isLoading } = trpc.helpers.list.useQuery()
    const { data: courses } = trpc.courses.list.useQuery()
    const [courseFilter, setCourseFilter] = useState<string>("ALL")

    useEffect(() => {
        if (user && (user as any).role === 'HELPER') router.push("/dashboard")
    }, [user, router])

    const filtered = helpers?.filter((h: any) => {
        // Only show helpers who have completed their profile
        if (!h.completedProfile) return false

        const matchSearch = !searchQuery ||
            h.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.expertise?.some((e: any) => e.name?.toLowerCase().includes(searchQuery.toLowerCase()) || e.code?.toLowerCase().includes(searchQuery.toLowerCase()))
        const matchCourse = courseFilter === 'ALL' || h.expertise?.some((e: any) => e.id === courseFilter)
        return matchSearch && matchCourse
    }) || []

    const getInitials = (name: string) => name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "H"

    const handleOpenProfile = (helperId: string) => {
        setSelectedHelperId(helperId)
        setIsModalOpen(true)
    }

    return (
        <div className="dash-wrapper" style={{ background: 'var(--bg-color)', minHeight: '100vh' }}>
            <StudentNavbar />
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

                {/* ── Premium Welcome Header ── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', animation: 'fadeInUp 0.5s ease-out' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ 
                                background: 'rgba(0, 126, 167, 0.1)', 
                                color: 'var(--primary)', 
                                padding: '4px 12px', 
                                borderRadius: 'var(--radius-pill)', 
                                fontSize: '0.75rem', 
                                fontWeight: 800, 
                                textTransform: 'uppercase', 
                                letterSpacing: '0.05em' 
                            }}>
                                Student Discovery
                            </span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                                Find your perfect expert match
                            </span>
                        </div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em', margin: 0 }}>
                            Browse Helpers.
                        </h1>
                    </div>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap', alignItems: 'center', animation: 'fadeInUp 0.6s ease-out' }}>
                    <div style={{ position: 'relative', flex: '1 1 300px' }}>
                        <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search by name, headline, course code..."
                            style={{ 
                                width: '100%', 
                                padding: '14px 16px 14px 48px', 
                                borderRadius: '16px', 
                                border: '1px solid var(--border-color)', 
                                background: '#fff', 
                                outline: 'none', 
                                fontSize: '0.9rem', 
                                fontWeight: 500,
                                transition: 'var(--transition)',
                                boxShadow: 'var(--shadow-sm)'
                            }}
                            onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(0, 126, 167, 0.1)' }}
                            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)' }}
                        />
                    </div>
                    <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} style={{ 
                        padding: '14px 20px', 
                        borderRadius: '16px', 
                        border: '1px solid var(--border-color)', 
                        background: '#fff', 
                        fontSize: '0.9rem', 
                        fontWeight: 600,
                        outline: 'none', 
                        cursor: 'pointer', 
                        minWidth: '220px', 
                        color: 'var(--text-main)',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'var(--transition)'
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                    >
                        <option value="ALL">All Subjects</option>
                        {courses?.map((c: any) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
                    </select>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, flexShrink: 0, background: 'rgba(0,0,0,0.05)', padding: '10px 20px', borderRadius: 'var(--radius-pill)' }}>
                        {filtered.length} Expert{filtered.length !== 1 ? 's' : ''} Available
                    </div>
                </div>

                {/* Cards Grid */}
                {isLoading ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>
                        <div className="loader-dots">Loading experts...</div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', padding: '5rem 2rem', textAlign: 'center', border: '2px dashed var(--border-color)', animation: 'fadeInUp 0.7s ease-out' }}>
                        <Users size={64} style={{ color: 'var(--border-color)', marginBottom: '1.5rem' }} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 8px' }}>No helpers found</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500 }}>Try adjusting your search or course filters.</p>
                    </div>
                ) : (
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', 
                        gap: '2rem',
                        animation: 'fadeInUp 0.7s ease-out'
                    }}>
                        {filtered.map((h: any) => (
                            <div key={h.id} onClick={() => handleOpenProfile(h.userId)} style={{
                                background: 'var(--card-bg)',
                                borderRadius: '24px',
                                padding: '2rem',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                border: '1px solid var(--border-color)',
                                boxShadow: 'var(--shadow-sm)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = 'var(--primary)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--border-color)' }}
                            >
                                {/* Top Badges */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#059669', padding: '4px 12px', borderRadius: 'var(--radius-pill)', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} /> Online
                                    </div>
                                    <div style={{ color: '#f59e0b', fontSize: '0.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Star size={14} fill="#f59e0b" /> 5.0
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.25rem' }}>
                                    <div style={{ 
                                        width: '72px', height: '72px', borderRadius: '20px', 
                                        background: 'var(--header-bg)', 
                                        color: '#9ad1d4', 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                        fontWeight: 800, fontSize: '1.5rem',
                                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                                    }}>
                                        {getInitials(h.user?.name || "H")}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '2px' }}>{h.user?.name}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>{h.headline || "Verified Expert"}</div>
                                    </div>
                                </div>

                                <div style={{ flex: 1, marginBottom: '1.5rem' }}>
                                    <p style={{ 
                                        fontSize: '0.9rem', 
                                        color: 'var(--text-muted)', 
                                        lineHeight: 1.6, 
                                        margin: '0 0 1.5rem',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {h.bio || "No bio information provided."}
                                    </p>

                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1.5rem' }}>
                                        {h.expertise?.slice(0, 3).map((e: any) => (
                                            <span key={e.id} style={{ 
                                                background: '#f1f5f9', 
                                                color: '#475569', 
                                                padding: '6px 12px', 
                                                borderRadius: '12px', 
                                                fontSize: '0.75rem', 
                                                fontWeight: 700 
                                            }}>
                                                {e.code}
                                            </span>
                                        ))}
                                        {h.expertise?.length > 3 && (
                                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', padding: '6px' }}>
                                                +{h.expertise.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div style={{ 
                                    marginTop: 'auto',
                                    paddingTop: '1.5rem', 
                                    borderTop: '1px solid var(--border-color)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px' }}>Rate</div>
                                        <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-main)' }}>
                                            <span style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>₵</span>{h.hourlyRate || "0.00"}<span style={{ fontSize: '0.8rem', opacity: 0.6 }}>/hr</span>
                                        </div>
                                    </div>
                                    <div style={{ 
                                        background: 'var(--primary)', 
                                        color: 'white', 
                                        padding: '10px 24px', 
                                        borderRadius: '16px', 
                                        fontSize: '0.85rem', 
                                        fontWeight: 800,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        boxShadow: '0 4px 12px rgba(0, 126, 167, 0.2)'
                                    }}>
                                        View Profile <ArrowUpRight size={16} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {selectedHelperId && (
                    <HelperProfileModal 
                        helperId={selectedHelperId}
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onBook={() => {
                            setIsModalOpen(false)
                            router.push(`/become-helper?helperId=${selectedHelperId}`)
                        }}
                    />
                )}
            </main>
        </div>
    )
}
