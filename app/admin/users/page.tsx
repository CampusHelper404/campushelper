"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { trpc } from "@/trpc/client"
import AdminNavbar from "@/components/dashboard/AdminNavbar"
import { Search, RefreshCw } from "lucide-react"

const pageStyle: React.CSSProperties = { minHeight: '100vh', background: '#f0f4f5', fontFamily: "'Inter', -apple-system, sans-serif", paddingTop: '64px' }
const mainStyle: React.CSSProperties = { maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }

function RoleBadge({ role }: { role: string }) {
    const map: Record<string, { bg: string, color: string }> = {
        ADMIN: { bg: '#fee2e2', color: '#dc2626' },
        HELPER: { bg: '#d1fae5', color: '#059669' },
        STUDENT: { bg: '#e0f2fe', color: '#0284c7' },
    }
    const s = map[role] || { bg: '#f1f5f9', color: '#64748b' }
    return <span style={{ background: s.bg, color: s.color, borderRadius: '20px', padding: '3px 10px', fontSize: '0.7rem', fontWeight: 800 }}>{role}</span>
}

export default function AdminUsersPage() {
    const router = useRouter()
    const { data: currentUser, isLoading } = trpc.users.me.useQuery()
    const { data: users, refetch, isLoading: usersLoading } = trpc.users.list.useQuery()
    const [search, setSearch] = useState("")
    const [roleFilter, setRoleFilter] = useState<string>("ALL")

    useEffect(() => {
        if (!isLoading && currentUser && (currentUser as any).role !== 'ADMIN') router.push('/student-dashboard')
    }, [currentUser, isLoading, router])

    const filtered = users?.filter((u: any) => {
        const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
        const matchRole = roleFilter === "ALL" || u.role === roleFilter
        return matchSearch && matchRole
    }) || []

    return (
        <div style={pageStyle}>
            <AdminNavbar />
            <main style={mainStyle}>
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#007ea7', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Admin Panel</div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#003249', letterSpacing: '-0.03em', margin: 0 }}>User Management</h1>
                    <p style={{ color: '#4a6a7c', marginTop: '6px' }}>View and manage all platform users.</p>
                </div>

                {/* Filters */}
                <div style={{ background: '#fff', borderRadius: '16px', padding: '1.25rem 1.5rem', boxShadow: '0 2px 8px rgba(0,50,73,0.06)', marginBottom: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: '1 1 250px' }}>
                        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        {['ALL', 'STUDENT', 'HELPER', 'ADMIN'].map(role => (
                            <button key={role} onClick={() => setRoleFilter(role)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, background: roleFilter === role ? '#003249' : '#f1f5f9', color: roleFilter === role ? '#9ad1d4' : '#64748b', transition: 'all 0.15s' }}>
                                {role}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => refetch()} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>

                {/* Table */}
                <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,50,73,0.06)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                {['User', 'Email', 'Role', 'Joined', 'Onboarded'].map(h => (
                                    <th key={h} style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {usersLoading ? (
                                <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading users...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No users found.</td></tr>
                            ) : filtered.map((u: any, i: number) => (
                                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafcfb', transition: 'background 0.1s' }}
                                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#f0f9ff'}
                                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? '#fff' : '#fafcfb'}>
                                    <td style={{ padding: '1rem 1.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#003249', color: '#9ad1d4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0 }}>
                                                {u.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                                            </div>
                                            <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#003249' }}>{u.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#4a6a7c' }}>{u.email}</td>
                                    <td style={{ padding: '1rem 1.25rem' }}><RoleBadge role={u.role} /></td>
                                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.82rem', color: '#64748b' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem 1.25rem' }}>
                                        <span style={{ background: u.onboarded ? '#d1fae5' : '#fee2e2', color: u.onboarded ? '#059669' : '#dc2626', borderRadius: '20px', padding: '3px 10px', fontSize: '0.7rem', fontWeight: 800 }}>
                                            {u.onboarded ? 'Yes' : 'No'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length > 0 && (
                        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #f1f5f9', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>
                            Showing {filtered.length} of {users?.length} users
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
