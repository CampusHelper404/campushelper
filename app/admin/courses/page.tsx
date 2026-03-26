"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { trpc } from "@/trpc/client"
import AdminNavbar from "@/components/dashboard/AdminNavbar"
import { toast } from "sonner"
import { Search, Plus, Trash2, BookOpen, RefreshCw, X, Pencil, Check } from "lucide-react"

const pageStyle: React.CSSProperties = { minHeight: '100vh', background: 'var(--background)', fontFamily: "'Inter', -apple-system, sans-serif" }
const mainStyle: React.CSSProperties = { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }
const cardStyle: React.CSSProperties = { background: 'var(--card)', borderRadius: '16px', boxShadow: '0 2px 8px color-mix(in srgb, var(--foreground) 6%, transparent)' }

export default function AdminCoursesPage() {
    const router = useRouter()
    const { data: currentUser, isLoading: authLoading } = trpc.users.me.useQuery()
    const { data: courses, refetch, isLoading } = trpc.courses.list.useQuery()
    const [search, setSearch] = useState("")
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState({ code: "", name: "", description: "" })
    const [editForm, setEditForm] = useState({ code: "", name: "", description: "" })

    const createCourse = trpc.courses.create.useMutation({
        onSuccess: () => {
            toast.success("Course created!")
            setForm({ code: "", name: "", description: "" })
            setShowForm(false)
            refetch()
        },
        onError: e => toast.error(e.message || "Failed to create course")
    })

    const deleteCourse = trpc.courses.delete.useMutation({
        onSuccess: () => { toast.success("Course deleted"); refetch() },
        onError: e => toast.error(e.message || "Failed to delete")
    })

    const updateCourse = trpc.courses.update.useMutation({
        onSuccess: () => { toast.success("Course updated!"); setEditingId(null); refetch() },
        onError: e => toast.error(e.message || "Failed to update")
    })

    useEffect(() => {
        if (!authLoading && currentUser && (currentUser as any).role !== 'ADMIN') router.push('/student-dashboard')
    }, [currentUser, authLoading, router])

    const filtered = courses?.filter((c: any) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase())
    ) || []

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.code.trim() || !form.name.trim()) { toast.error("Code and Name are required"); return }
        createCourse.mutate({ code: form.code.trim().toUpperCase(), name: form.name.trim(), description: form.description.trim() || undefined })
    }

    const startEdit = (course: any) => {
        setEditingId(course.id)
        setEditForm({ code: course.code, name: course.name, description: course.description || "" })
    }

    const handleUpdate = (id: string) => {
        updateCourse.mutate({ id, code: editForm.code.trim().toUpperCase(), name: editForm.name.trim(), description: editForm.description.trim() || undefined })
    }

    return (
        <div style={pageStyle}>
            <AdminNavbar />
            <main className="ch-page-main" style={mainStyle}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                    <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                            Admin Panel
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--foreground)', letterSpacing: '-0.03em', margin: 0 }}>
                            Course Catalogue
                        </h1>
                        <p style={{ color: 'var(--muted-foreground)', marginTop: '6px', fontSize: '0.9rem' }}>
                            Manage the courses helpers can list as their areas of expertise.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowForm(v => !v)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: showForm ? 'var(--muted)' : 'var(--foreground)',
                            color: showForm ? 'var(--muted-foreground)' : 'var(--chart-3)',
                            border: 'none', padding: '11px 22px', borderRadius: '12px',
                            fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
                            transition: 'all 0.2s', boxShadow: showForm ? 'none' : '0 4px 12px color-mix(in srgb, var(--foreground) 20%, transparent)'
                        }}
                    >
                        {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Add Course</>}
                    </button>
                </div>

                {/* Add Course Form */}
                {showForm && (
                    <div style={{ ...cardStyle, padding: '1.75rem', marginBottom: '1.25rem', border: '1.5px solid color-mix(in srgb, var(--primary) 15%, transparent)', animation: 'fadeIn 0.2s ease' }}>
                        <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 800, color: 'var(--foreground)' }}>New Course</h3>
                        <form onSubmit={handleCreate} className="ch-admin-form" style={{ display: 'grid', gridTemplateColumns: '180px 1fr 1fr auto', gap: '12px', alignItems: 'flex-end' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                                    Course Code *
                                </label>
                                <input
                                    required
                                    placeholder="e.g. CS101"
                                    value={form.code}
                                    onChange={e => setForm(p => ({ ...p, code: e.target.value }))}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--muted)', outline: 'none', fontSize: '0.85rem', fontWeight: 700, boxSizing: 'border-box', textTransform: 'uppercase' }}
                                    onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                                    onBlur={e => e.currentTarget.style.borderColor = 'var(--muted)'}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                                    Course Name *
                                </label>
                                <input
                                    required
                                    placeholder="e.g. Introduction to Computer Science"
                                    value={form.name}
                                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--muted)', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }}
                                    onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                                    onBlur={e => e.currentTarget.style.borderColor = 'var(--muted)'}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                                    Description (optional)
                                </label>
                                <input
                                    placeholder="Brief description..."
                                    value={form.description}
                                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--muted)', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }}
                                    onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                                    onBlur={e => e.currentTarget.style.borderColor = 'var(--muted)'}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={createCourse.isPending}
                                style={{ padding: '10px 24px', borderRadius: '10px', background: 'var(--primary)', color: 'var(--card)', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap', opacity: createCourse.isPending ? 0.7 : 1 }}
                            >
                                {createCourse.isPending ? 'Saving...' : 'Add Course'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Filter Bar */}
                <div className="ch-filter-bar" style={{ ...cardStyle, padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} size={16} />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name or code..."
                            style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid var(--muted)', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted-foreground)', background: 'var(--muted)', padding: '8px 16px', borderRadius: '8px', flexShrink: 0 }}>
                        {filtered.length} course{filtered.length !== 1 ? 's' : ''}
                    </div>
                    <button onClick={() => refetch()} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '10px', border: '1px solid var(--muted)', background: 'var(--sidebar)', color: 'var(--muted-foreground)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>

                {/* Courses Table */}
                <div className="ch-table-container" style={{ ...cardStyle, overflow: 'hidden' }}>
                    {isLoading ? (
                        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Loading courses...</div>
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: '4rem', textAlign: 'center' }}>
                            <BookOpen size={48} style={{ color: 'var(--muted)', marginBottom: '1rem' }} />
                            <p style={{ fontWeight: 700, color: 'var(--muted-foreground)', margin: 0 }}>
                                {search ? 'No courses match your search.' : 'No courses yet. Add your first course above.'}
                            </p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                            <thead style={{ background: 'var(--sidebar)', borderBottom: '1px solid var(--muted)' }}>
                                <tr>
                                    {['Code', 'Course Name', 'Description', 'Actions'].map(h => (
                                        <th key={h} style={{ padding: '0.9rem 1.25rem', fontSize: '0.72rem', fontWeight: 800, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((c: any, i: number) => (
                                    <tr
                                        key={c.id}
                                        style={{ borderBottom: '1px solid var(--muted)', background: i % 2 === 0 ? 'var(--card)' : 'var(--background)', transition: 'background 0.1s' }}
                                        onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#f0f9ff'}
                                        onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? 'var(--card)' : 'var(--background)'}
                                    >
                                        {editingId === c.id ? (
                                            <>
                                                <td style={{ padding: '0.75rem 1.25rem' }}>
                                                    <input value={editForm.code} onChange={e => setEditForm(p => ({ ...p, code: e.target.value }))}
                                                        style={{ padding: '7px 10px', borderRadius: '8px', border: '1.5px solid var(--primary)', fontSize: '0.82rem', fontWeight: 700, width: '90px', textTransform: 'uppercase', outline: 'none' }} />
                                                </td>
                                                <td style={{ padding: '0.75rem 1.25rem' }}>
                                                    <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                                                        style={{ padding: '7px 10px', borderRadius: '8px', border: '1.5px solid var(--primary)', fontSize: '0.82rem', width: '100%', outline: 'none', boxSizing: 'border-box' }} />
                                                </td>
                                                <td style={{ padding: '0.75rem 1.25rem' }}>
                                                    <input value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                                                        style={{ padding: '7px 10px', borderRadius: '8px', border: '1.5px solid var(--primary)', fontSize: '0.82rem', width: '100%', outline: 'none', boxSizing: 'border-box' }} />
                                                </td>
                                                <td style={{ padding: '0.75rem 1.25rem' }}>
                                                    <div style={{ display: 'flex', gap: '6px' }}>
                                                        <button onClick={() => handleUpdate(c.id)} disabled={updateCourse.isPending}
                                                            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 14px', borderRadius: '8px', background: 'var(--primary)', color: 'var(--card)', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}>
                                                            <Check size={13} /> Save
                                                        </button>
                                                        <button onClick={() => setEditingId(null)}
                                                            style={{ padding: '6px 12px', borderRadius: '8px', background: 'var(--muted)', color: 'var(--muted-foreground)', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}>
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td style={{ padding: '1rem 1.25rem' }}>
                                                    <span style={{ background: 'color-mix(in srgb, var(--primary) 8%, transparent)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 800 }}>
                                                        {c.code}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem 1.25rem', fontWeight: 700, fontSize: '0.88rem', color: 'var(--foreground)' }}>{c.name}</td>
                                                <td style={{ padding: '1rem 1.25rem', fontSize: '0.82rem', color: 'var(--muted-foreground)', maxWidth: '300px' }}>
                                                    {c.description || <span style={{ opacity: 0.4, fontStyle: 'italic' }}>No description</span>}
                                                </td>
                                                <td style={{ padding: '1rem 1.25rem' }}>
                                                    <div style={{ display: 'flex', gap: '6px' }}>
                                                        <button onClick={() => startEdit(c)}
                                                            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', background: 'var(--muted)', color: 'var(--muted-foreground)', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, transition: 'all 0.15s' }}
                                                            onMouseEnter={e => { e.currentTarget.style.background = '#e0eaec'; e.currentTarget.style.color = 'var(--foreground)' }}
                                                            onMouseLeave={e => { e.currentTarget.style.background = 'var(--muted)'; e.currentTarget.style.color = 'var(--muted-foreground)' }}>
                                                            <Pencil size={13} /> Edit
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm(`Delete "${c.code} – ${c.name}"? This cannot be undone.`)) {
                                                                    deleteCourse.mutate({ id: c.id })
                                                                }
                                                            }}
                                                            disabled={deleteCourse.isPending}
                                                            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', background: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, transition: 'all 0.15s' }}
                                                            onMouseEnter={e => e.currentTarget.style.background = '#fecaca'}
                                                            onMouseLeave={e => e.currentTarget.style.background = '#fee2e2'}>
                                                            <Trash2 size={13} /> Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {filtered.length > 0 && (
                        <div style={{ padding: '0.9rem 1.25rem', borderTop: '1px solid var(--muted)', fontSize: '0.78rem', color: 'var(--muted-foreground)', fontWeight: 600 }}>
                            {filtered.length} of {courses?.length} courses
                        </div>
                    )}
                </div>
            </main>

            <style jsx global>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    )
}
