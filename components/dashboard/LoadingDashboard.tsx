"use client"

import { Loader2 } from "lucide-react"

export default function LoadingDashboard() {
    return (
        <div style={{ 
            height: '100vh', 
            width: '100vw', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            background: 'var(--sidebar)',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
            <div style={{
                padding: '3rem',
                borderRadius: '24px',
                background: 'color-mix(in srgb, var(--card) 70%, transparent)',
                backdropFilter: 'blur(10px)',
                border: '1px solid color-mix(in srgb, var(--card) 80%, transparent)',
                boxShadow: '0 20px 40px color-mix(in srgb, var(--foreground) 5%, transparent)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem',
                animation: 'fadeIn 0.5s ease-out'
            }}>
                <div style={{ position: 'relative' }}>
                    <Loader2 size={48} className="animate-spin" style={{ color: 'var(--primary)' }} />
                    <div style={{ 
                        position: 'absolute', 
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%)',
                        width: '8px',
                        height: '8px',
                        background: 'var(--foreground)',
                        borderRadius: '50%'
                    }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
                        Campus<span style={{ color: 'var(--primary)' }}>Helper</span>
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--muted-foreground)', fontWeight: 600 }}>
                        Securing your session...
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}
