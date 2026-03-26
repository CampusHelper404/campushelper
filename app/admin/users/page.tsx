"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { trpc } from "@/trpc/client"
import AdminNavbar from "@/components/dashboard/AdminNavbar"
import { Search, RefreshCw } from "lucide-react"

const pageStyle: React.CSSProperties = { minHeight: '100vh', background: 'var(--background)', fontFamily: "'Inter', -apple-system, sans-serif" }
const mainStyle: React.CSSProperties = { maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }

function RoleBadge({ role }: { role: string }) {
    const map: Record<string, { bg: string, color: string }> = {
        ADMIN: { bg: '#fee2e2', color: '#dc2626' },
        HELPER: { bg: '#d1fae5', color: '#059669' },
        STUDENT: { bg: '#e0f2fe', color: '#0284c7' },
    }
    const s = map[role] || { bg: 'var(--muted)', color: 'var(--muted-foreground)' }
    return <span style={{ background: s.bg, color: s.color, borderRadius: '20px', padding: '3px 10px', fontSize: '0.7rem', fontWeight: 800 }}>{role}</span>
}

export default function AdminUsersPage() {
    const router = useRouter()
    const { data: currentUser, isLoading } = trpc.users.me.useQuery()
    const { data: users, refetch, isLoading: usersLoading } = trpc.users.list.useQuery()
    const trpcContext = trpc.useUtils()
    const updateUser = trpc.users.updateUserAdmin.useMutation({
        onSuccess: () => {
            trpcContext.users.list.invalidate()
        }
    })
    const [search, setSearch] = useState("")
    const [roleFilter, setRoleFilter] = useState<string>("ALL")

    const handleSuspendToggle = (userId: string, currentStatus: boolean) => {
        if (confirm(`Are you sure you want to ${currentStatus ? 'unsuspend' : 'suspend'} this user?`)) {
            updateUser.mutate({ id: userId, isSuspended: !currentStatus })
        }
    }

    const handleRoleChange = (userId: string, newRole: string) => {
        if (confirm(`Change role to ${newRole}?`)) {
            updateUser.mutate({ id: userId, role: newRole as any })
        }
    }

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
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Admin Panel</div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--foreground)', letterSpacing: '-0.03em', margin: 0 }}>User Management</h1>
                    <p style={{ color: 'var(--muted-foreground)', marginTop: '6px' }}>View and manage all platform users.</p>
                </div>

                {/* Filters */}
                <div style={{ background: 'var(--card)', borderRadius: '16px', padding: '1.25rem 1.5rem', boxShadow: '0 2px 8px color-mix(in srgb, var(--foreground) 6%, transparent)', marginBottom: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: '1 1 250px' }}>
                        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} size={16} />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid var(--muted)', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        {['ALL', 'STUDENT', 'HELPER', 'ADMIN'].map(role => (
                            <button key={role} onClick={() => setRoleFilter(role)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, background: roleFilter === role ? 'var(--foreground)' : 'var(--muted)', color: roleFilter === role ? 'var(--chart-3)' : 'var(--muted-foreground)', transition: 'all 0.15s' }}>
                                {role}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => refetch()} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '10px', border: '1px solid var(--muted)', background: 'var(--sidebar)', color: 'var(--muted-foreground)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>

                {/* Table */}
                <div className="ch-table-container" style={{ background: 'var(--card)', borderRadius: '16px', boxShadow: '0 2px 8px color-mix(in srgb, var(--foreground) 6%, transparent)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                        <thead style={{ background: 'var(--sidebar)', borderBottom: '1px solid var(--muted)' }}>
                            <tr>
                                {['User', 'Email', 'Role & Status', 'Joined', 'Onboarded', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {usersLoading ? (
                                <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Loading users...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>No users found.</td></tr>
                            ) : filtered.map((u: any, i: number) => (
                                <tr key={u.id} style={{ borderBottom: '1px solid var(--muted)', background: i % 2 === 0 ? 'var(--card)' : 'var(--background)', transition: 'background 0.1s' }}
                                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#f0f9ff'}
                                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? 'var(--card)' : 'var(--background)'}>
                                    <td style={{ padding: '1rem 1.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--foreground)', color: 'var(--chart-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0 }}>
                                                {u.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                                            </div>
                                            <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--foreground)' }}>{u.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>{u.email}</td>
                                    <td style={{ padding: '1rem 1.25rem' }}>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <RoleBadge role={u.role} />
                                            {u.isSuspended && (
                                                <span style={{ background: '#fee2e2', color: '#dc2626', borderRadius: '20px', padding: '3px 10px', fontSize: '0.7rem', fontWeight: 800 }}>Suspended</span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.82rem', color: 'var(--muted-foreground)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem 1.25rem' }}>
                                        <span style={{ background: u.onboarded ? '#d1fae5' : '#fee2e2', color: u.onboarded ? '#059669' : '#dc2626', borderRadius: '20px', padding: '3px 10px', fontSize: '0.7rem', fontWeight: 800 }}>
                                            {u.onboarded ? 'Yes' : 'No'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.25rem' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <select 
                                                value={u.role} 
                                                onChange={e => handleRoleChange(u.id, e.target.value)}
                                                style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--muted)', fontSize: '0.75rem', outline: 'none', background: 'var(--card)' }}
                                                disabled={updateUser.isPending}
                                            >
                                                <option value="STUDENT">Student</option>
                                                <option value="HELPER">Helper</option>
                                                <option value="ADMIN">Admin</option>
                                            </select>
                                            <button 
                                                onClick={() => handleSuspendToggle(u.id, !!u.isSuspended)}
                                                disabled={updateUser.isPending}
                                                style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '4px',
                                                    border: 'none',
                                                    background: u.isSuspended ? '#d1fae5' : '#fee2e2',
                                                    color: u.isSuspended ? '#059669' : '#dc2626',
                                                    fontSize: '0.75rem',
                                                    cursor: updateUser.isPending ? 'not-allowed' : 'pointer',
                                                    fontWeight: 700,
                                                    opacity: updateUser.isPending ? 0.6 : 1
                                                }}
                                            >
                                                {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length > 0 && (
                        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--muted)', fontSize: '0.78rem', color: 'var(--muted-foreground)', fontWeight: 600 }}>
                            Showing {filtered.length} of {users?.length} users
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
