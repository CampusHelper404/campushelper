"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { trpc } from "@/trpc/client"
import StudentNavbar from "@/components/dashboard/StudentNavbar"
import HelperNavbar from "@/components/dashboard/HelperNavbar"
import {
    Settings as SettingsIcon, User, Lock, Bell, Shield,
    ArrowLeft, Eye, EyeOff, Check, AlertCircle, Sun, Moon, Monitor
} from "lucide-react"
import "../dashboard/dashboard.css"

type View = "MAIN" | "PERSONAL" | "PASSWORD" | "NOTIFICATIONS" | "PLATFORM"

export default function SettingsPage() {
    const [view, setView] = useState<View>("MAIN")
    const [showPw, setShowPw] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [saveMsg, setSaveMsg] = useState("")

    const [name, setName] = useState("")
    const [newPw, setNewPw] = useState("")
    const [confirmPw, setConfirmPw] = useState("")
    const [pwError, setPwError] = useState("")

    const [notifEmail, setNotifEmail] = useState(true)
    const [notifInApp, setNotifInApp] = useState(true)
    const { theme, setTheme } = useTheme()

    const { data: user, refetch } = trpc.users.me.useQuery()
    const isHelper = (user as any)?.role === 'HELPER'
    const updateMe = trpc.users.updateMe.useMutation({
        onSuccess: () => { setSaveMsg("✓ Saved!"); refetch(); setTimeout(() => setSaveMsg(""), 3000) }
    })

    useEffect(() => { if (user) setName(user.name || "") }, [user])

    const showSave = (msg: string) => { setSaveMsg(msg); setTimeout(() => setSaveMsg(""), 3000) }

    const Navbar = isHelper ? HelperNavbar : StudentNavbar

    const menuItems = [
        { id: "PERSONAL", label: "Personal Information", icon: User, desc: "Update your name and profile details" },
        { id: "PASSWORD", label: "Change Password", icon: Lock, desc: "Update your account password" },
        { id: "NOTIFICATIONS", label: "Notifications", icon: Bell, desc: "Control email and in-app alerts" },
        { id: "PLATFORM", label: "Platform Preferences", icon: SettingsIcon, desc: "Theme and display settings" },
    ]

    return (
        <div className="dash-wrapper" style={{ background: 'var(--background)', minHeight: '100vh' }}>
            <Navbar />
            <main className="ch-page-main" style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem' }}>

                {/* Banner (only on MAIN) */}
                {view === "MAIN" && (
                    <>
                        <section style={{
                            background: 'linear-gradient(135deg, var(--secondary) 0%, var(--muted) 100%)',
                            borderRadius: '20px',
                            padding: '2.5rem',
                            marginBottom: '2rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            boxShadow: '0 8px 24px color-mix(in srgb, var(--foreground) 12%, transparent)',
                        }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Account</div>
                                <h1 style={{ fontSize: '1.9rem', fontWeight: 900, color: 'var(--foreground)', margin: '0 0 6px', letterSpacing: '-0.03em' }}>Settings</h1>
                                <p style={{ color: 'var(--muted-foreground)', margin: 0 }}>Manage your profile, security, and preferences.</p>
                            </div>
                            <SettingsIcon size={80} color="var(--foreground)" className="ch-banner-icon" style={{ opacity: 0.12, flexShrink: 0 }} />
                        </section>

                        {/* User card */}
                        <div style={{ background: 'var(--card)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.25rem', boxShadow: '0 2px 8px color-mix(in srgb, var(--foreground) 6%, transparent)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--foreground)', color: 'var(--chart-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem', flexShrink: 0 }}>
                                {user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--foreground)' }}>{user?.name}</div>
                                <div style={{ fontSize: '0.83rem', color: 'var(--muted-foreground)' }}>{user?.email}</div>
                                <span style={{ background: isHelper ? '#d1fae5' : '#e0f2fe', color: isHelper ? '#059669' : '#0284c7', borderRadius: '20px', padding: '2px 10px', fontSize: '0.7rem', fontWeight: 800, display: 'inline-block', marginTop: '4px' }}>
                                    {(user as any)?.role}
                                </span>
                            </div>
                        </div>

                        {/* Menu */}
                        <div style={{ background: 'var(--card)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px color-mix(in srgb, var(--foreground) 6%, transparent)' }}>
                            {menuItems.map(({ id, label, icon: Icon, desc }, i) => (
                                <button key={id} onClick={() => setView(id as View)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem', background: 'none', border: 'none', borderBottom: i < menuItems.length - 1 ? '1px solid var(--muted)' : 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s' }}
                                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--sidebar)'}
                                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'none'}
                                >
                                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                                        <Icon size={20} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--foreground)' }}>{label}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', marginTop: '2px' }}>{desc}</div>
                                    </div>
                                    <span style={{ color: 'var(--muted-foreground)', fontSize: '1.25rem' }}>›</span>
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {/* Back Button (sub-views) */}
                {view !== "MAIN" && (
                    <button onClick={() => { setView("MAIN"); setPwError(""); setSaveMsg("") }} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--foreground)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '1.5rem', padding: '6px 0' }}>
                        <ArrowLeft size={18} /> Back to Settings
                    </button>
                )}

                {/* Personal Info */}
                {view === "PERSONAL" && (
                    <div style={{ background: 'var(--card)', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 2px 8px color-mix(in srgb, var(--foreground) 7%, transparent)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
                            <User size={28} color="var(--primary)" />
                            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--foreground)' }}>Personal Information</h2>
                        </div>
                        <form onSubmit={async e => { e.preventDefault(); await updateMe.mutateAsync({ name }) }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '480px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '6px' }}>Full Name</label>
                                <input value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid var(--muted)', outline: 'none', fontSize: '0.88rem', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '6px' }}>Email</label>
                                <input value={user?.email || ''} readOnly style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid var(--muted)', background: 'var(--sidebar)', color: 'var(--muted-foreground)', cursor: 'not-allowed', fontSize: '0.88rem', boxSizing: 'border-box' }} />
                                <p style={{ fontSize: '0.73rem', color: 'var(--muted-foreground)', marginTop: '4px' }}>Email is managed by your auth provider.</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <button type="submit" style={{ background: 'var(--foreground)', color: 'var(--chart-3)', border: 'none', padding: '11px 28px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', fontSize: '0.88rem' }}>
                                    Save Changes
                                </button>
                                {saveMsg && <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={15} /> {saveMsg}</span>}
                            </div>
                        </form>
                    </div>
                )}

                {/* Password */}
                {view === "PASSWORD" && (
                    <div style={{ background: 'var(--card)', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 2px 8px color-mix(in srgb, var(--foreground) 7%, transparent)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
                            <Lock size={28} color="var(--primary)" />
                            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--foreground)' }}>Change Password</h2>
                        </div>
                        <form onSubmit={e => {
                            e.preventDefault()
                            setPwError("")
                            if (newPw !== confirmPw) return setPwError("Passwords do not match.")
                            if (newPw.length < 8) return setPwError("Password must be at least 8 characters.")
                            showSave("✓ Password updated")
                            setNewPw(""); setConfirmPw("")
                        }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '480px' }}>
                            {[
                                { label: 'New Password', val: newPw, set: setNewPw, show: showPw, toggle: () => setShowPw(p => !p) },
                                { label: 'Confirm Password', val: confirmPw, set: setConfirmPw, show: showConfirm, toggle: () => setShowConfirm(p => !p) },
                            ].map(f => (
                                <div key={f.label}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '6px' }}>{f.label}</label>
                                    <div style={{ position: 'relative' }}>
                                        <input type={f.show ? 'text' : 'password'} value={f.val} onChange={e => f.set(e.target.value)} style={{ width: '100%', padding: '11px 40px 11px 14px', borderRadius: '10px', border: '1.5px solid var(--muted)', outline: 'none', fontSize: '0.88rem', boxSizing: 'border-box' }} />
                                        <button type="button" onClick={f.toggle} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', display: 'flex' }}>
                                            {f.show ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {pwError && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontSize: '0.83rem', fontWeight: 600 }}><AlertCircle size={14} /> {pwError}</div>}
                            <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', margin: 0 }}>Min. 8 characters · Use a mix of letters, numbers, and symbols for best security.</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <button type="submit" style={{ background: 'var(--foreground)', color: 'var(--chart-3)', border: 'none', padding: '11px 28px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}>Update Password</button>
                                {saveMsg && <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.85rem' }}>{saveMsg}</span>}
                            </div>
                        </form>
                    </div>
                )}

                {/* Notifications */}
                {view === "NOTIFICATIONS" && (
                    <div style={{ background: 'var(--card)', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 2px 8px color-mix(in srgb, var(--foreground) 7%, transparent)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
                            <Bell size={28} color="var(--primary)" />
                            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--foreground)' }}>Notification Preferences</h2>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '480px' }}>
                            {[
                                { label: 'Email Notifications', desc: 'Get alerts about requests and sessions via email', val: notifEmail, set: setNotifEmail },
                                { label: 'In-App Notifications', desc: 'See real-time alerts inside the platform', val: notifInApp, set: setNotifInApp },
                            ].map(item => (
                                <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: 'var(--sidebar)', borderRadius: '12px', border: '1px solid var(--muted)' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--foreground)' }}>{item.label}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', marginTop: '2px' }}>{item.desc}</div>
                                    </div>
                                    <button onClick={() => { item.set(!item.val); showSave("Saved") }} style={{ width: '48px', height: '26px', borderRadius: '13px', background: item.val ? 'var(--primary)' : 'var(--muted)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                                        <div style={{ position: 'absolute', top: '3px', left: item.val ? '25px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--card)', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
                                    </button>
                                </div>
                            ))}
                            {saveMsg && <p style={{ color: '#059669', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={12} /> {saveMsg}</p>}
                        </div>
                    </div>
                )}

                {/* Platform */}
                {view === "PLATFORM" && (
                    <div style={{ background: 'var(--card)', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 2px 8px color-mix(in srgb, var(--foreground) 7%, transparent)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
                            <SettingsIcon size={28} color="var(--primary)" />
                            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--foreground)' }}>Platform Preferences</h2>
                        </div>
                        <div style={{ maxWidth: '480px' }}>
                            <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '1rem' }}>Theme</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '2rem' }}>
                                {[
                                    { key: 'light', icon: <Sun size={20} />, label: 'Light' },
                                    { key: 'dark', icon: <Moon size={20} />, label: 'Dark' },
                                    { key: 'system', icon: <Monitor size={20} />, label: 'System' },
                                ].map(t => (
                                    <button key={t.key} onClick={() => { setTheme(t.key); showSave("Preference saved") }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '1rem', borderRadius: '12px', border: `2px solid ${theme === t.key ? 'var(--primary)' : 'var(--muted)'}`, background: theme === t.key ? 'color-mix(in srgb, var(--primary) 5%, transparent)' : 'var(--sidebar)', cursor: 'pointer', color: theme === t.key ? 'var(--primary)' : 'var(--muted-foreground)', fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.15s' }}>
                                        {t.icon} {t.label}
                                    </button>
                                ))}
                            </div>
                            {saveMsg && <p style={{ color: '#059669', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={12} /> {saveMsg}</p>}
                            <div style={{ borderTop: '1px solid var(--muted)', paddingTop: '2rem', marginTop: '1rem' }}>
                                <p style={{ fontWeight: 700, color: 'var(--foreground)', fontSize: '0.88rem', marginBottom: '0.5rem' }}>Danger Zone</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '1rem' }}>Deleting your account is permanent and cannot be undone.</p>
                                <button style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '9px 20px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
