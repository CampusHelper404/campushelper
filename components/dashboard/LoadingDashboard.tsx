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
            background: '#f8fafc',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
            <div style={{
                padding: '3rem',
                borderRadius: '24px',
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 20px 40px rgba(0, 50, 73, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem',
                animation: 'fadeIn 0.5s ease-out'
            }}>
                <div style={{ position: 'relative' }}>
                    <Loader2 size={48} className="animate-spin" style={{ color: '#007ea7' }} />
                    <div style={{ 
                        position: 'absolute', 
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%)',
                        width: '8px',
                        height: '8px',
                        background: '#003249',
                        borderRadius: '50%'
                    }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#003249', letterSpacing: '-0.02em' }}>
                        Campus<span style={{ color: '#007ea7' }}>Helper</span>
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
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
