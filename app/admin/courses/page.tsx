"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { trpc } from "@/trpc/client"
import AdminNavbar from "@/components/dashboard/AdminNavbar"
import { toast } from "sonner"
import { Search, Plus, Trash2, BookOpen, RefreshCw, X, Pencil, Check } from "lucide-react"

const pageStyle: React.CSSProperties = { minHeight: '100vh', background: '#f0f4f5', fontFamily: "'Inter', -apple-system, sans-serif", paddingTop: '64px' }
const mainStyle: React.CSSProperties = { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }
const cardStyle: React.CSSProperties = { background: '#fff', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,50,73,0.06)' }

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
            <main style={mainStyle}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                    <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#007ea7', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                            Admin Panel
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#003249', letterSpacing: '-0.03em', margin: 0 }}>
                            Course Catalogue
                        </h1>
                        <p style={{ color: '#4a6a7c', marginTop: '6px', fontSize: '0.9rem' }}>
                            Manage the courses helpers can list as their areas of expertise.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowForm(v => !v)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: showForm ? '#f1f5f9' : '#003249',
                            color: showForm ? '#64748b' : '#9ad1d4',
                            border: 'none', padding: '11px 22px', borderRadius: '12px',
                            fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
                            transition: 'all 0.2s', boxShadow: showForm ? 'none' : '0 4px 12px rgba(0,50,73,0.2)'
                        }}
                    >
                        {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Add Course</>}
                    </button>
                </div>

                {/* Add Course Form */}
                {showForm && (
                    <div style={{ ...cardStyle, padding: '1.75rem', marginBottom: '1.25rem', border: '1.5px solid rgba(0,126,167,0.15)', animation: 'fadeIn 0.2s ease' }}>
                        <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 800, color: '#003249' }}>New Course</h3>
                        <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 1fr auto', gap: '12px', alignItems: 'flex-end' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                                    Course Code *
                                </label>
                                <input
                                    required
                                    placeholder="e.g. CS101"
                                    value={form.code}
                                    onChange={e => setForm(p => ({ ...p, code: e.target.value }))}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.85rem', fontWeight: 700, boxSizing: 'border-box', textTransform: 'uppercase' }}
                                    onFocus={e => e.currentTarget.style.borderColor = '#007ea7'}
                                    onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                                    Course Name *
                                </label>
                                <input
                                    required
                                    placeholder="e.g. Introduction to Computer Science"
                                    value={form.name}
                                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }}
                                    onFocus={e => e.currentTarget.style.borderColor = '#007ea7'}
                                    onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                                    Description (optional)
                                </label>
                                <input
                                    placeholder="Brief description..."
                                    value={form.description}
                                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }}
                                    onFocus={e => e.currentTarget.style.borderColor = '#007ea7'}
                                    onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={createCourse.isPending}
                                style={{ padding: '10px 24px', borderRadius: '10px', background: '#007ea7', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap', opacity: createCourse.isPending ? 0.7 : 1 }}
                            >
                                {createCourse.isPending ? 'Saving...' : 'Add Course'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Filter Bar */}
                <div style={{ ...cardStyle, padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name or code..."
                            style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', background: '#f1f5f9', padding: '8px 16px', borderRadius: '8px', flexShrink: 0 }}>
                        {filtered.length} course{filtered.length !== 1 ? 's' : ''}
                    </div>
                    <button onClick={() => refetch()} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>

                {/* Courses Table */}
                <div style={{ ...cardStyle, overflow: 'hidden' }}>
                    {isLoading ? (
                        <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>Loading courses...</div>
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: '4rem', textAlign: 'center' }}>
                            <BookOpen size={48} style={{ color: '#e2e8f0', marginBottom: '1rem' }} />
                            <p style={{ fontWeight: 700, color: '#94a3b8', margin: 0 }}>
                                {search ? 'No courses match your search.' : 'No courses yet. Add your first course above.'}
                            </p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <tr>
                                    {['Code', 'Course Name', 'Description', 'Actions'].map(h => (
                                        <th key={h} style={{ padding: '0.9rem 1.25rem', fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((c: any, i: number) => (
                                    <tr
                                        key={c.id}
                                        style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafcfb', transition: 'background 0.1s' }}
                                        onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#f0f9ff'}
                                        onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? '#fff' : '#fafcfb'}
                                    >
                                        {editingId === c.id ? (
                                            <>
                                                <td style={{ padding: '0.75rem 1.25rem' }}>
                                                    <input value={editForm.code} onChange={e => setEditForm(p => ({ ...p, code: e.target.value }))}
                                                        style={{ padding: '7px 10px', borderRadius: '8px', border: '1.5px solid #007ea7', fontSize: '0.82rem', fontWeight: 700, width: '90px', textTransform: 'uppercase', outline: 'none' }} />
                                                </td>
                                                <td style={{ padding: '0.75rem 1.25rem' }}>
                                                    <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                                                        style={{ padding: '7px 10px', borderRadius: '8px', border: '1.5px solid #007ea7', fontSize: '0.82rem', width: '100%', outline: 'none', boxSizing: 'border-box' }} />
                                                </td>
                                                <td style={{ padding: '0.75rem 1.25rem' }}>
                                                    <input value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                                                        style={{ padding: '7px 10px', borderRadius: '8px', border: '1.5px solid #007ea7', fontSize: '0.82rem', width: '100%', outline: 'none', boxSizing: 'border-box' }} />
                                                </td>
                                                <td style={{ padding: '0.75rem 1.25rem' }}>
                                                    <div style={{ display: 'flex', gap: '6px' }}>
                                                        <button onClick={() => handleUpdate(c.id)} disabled={updateCourse.isPending}
                                                            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 14px', borderRadius: '8px', background: '#007ea7', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}>
                                                            <Check size={13} /> Save
                                                        </button>
                                                        <button onClick={() => setEditingId(null)}
                                                            style={{ padding: '6px 12px', borderRadius: '8px', background: '#f1f5f9', color: '#64748b', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}>
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td style={{ padding: '1rem 1.25rem' }}>
                                                    <span style={{ background: 'rgba(0,126,167,0.08)', color: '#007ea7', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 800 }}>
                                                        {c.code}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem 1.25rem', fontWeight: 700, fontSize: '0.88rem', color: '#003249' }}>{c.name}</td>
                                                <td style={{ padding: '1rem 1.25rem', fontSize: '0.82rem', color: '#4a6a7c', maxWidth: '300px' }}>
                                                    {c.description || <span style={{ opacity: 0.4, fontStyle: 'italic' }}>No description</span>}
                                                </td>
                                                <td style={{ padding: '1rem 1.25rem' }}>
                                                    <div style={{ display: 'flex', gap: '6px' }}>
                                                        <button onClick={() => startEdit(c)}
                                                            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', background: '#f1f5f9', color: '#64748b', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, transition: 'all 0.15s' }}
                                                            onMouseEnter={e => { e.currentTarget.style.background = '#e0eaec'; e.currentTarget.style.color = '#003249' }}
                                                            onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b' }}>
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
                        <div style={{ padding: '0.9rem 1.25rem', borderTop: '1px solid #f1f5f9', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>
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
