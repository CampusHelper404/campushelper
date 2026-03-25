"use client"

import { trpc } from "@/trpc/client"
import { ProfileSetupForm } from "@/components/dashboard/ProfileSetupForm"
import HelperNavbar from "@/components/dashboard/HelperNavbar"
import LoadingDashboard from "@/components/dashboard/LoadingDashboard"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react"
import Image from "next/image"
import "../dashboard.css"

export default function ProfileSetupPage() {
  const router = useRouter()
  const { data: user, isLoading } = trpc.users.me.useQuery()

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role !== 'HELPER' && user.role !== 'ADMIN') {
        router.push("/dashboard")
      }
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return <LoadingDashboard />
  }

  return (
    <div className="dash-wrapper" style={{ minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <HelperNavbar />

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.5rem 4rem', display: 'flex', flexDirection: 'column', gap: '0' }}>
        
        {/* ── Page Header ── */}
        <div style={{ marginBottom: '2rem', animation: 'fadeInUp 0.5s ease-out' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{
              background: 'rgba(16,185,129,0.1)',
              color: '#059669',
              padding: '5px 14px',
              borderRadius: '9999px',
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <ShieldCheck size={13} /> Verification Approved
            </div>
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em', margin: 0 }}>
            Complete Your Profile
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '6px', fontWeight: 500 }}>
            Set up your expert profile so students can find and book you.
          </p>
        </div>

        {/* ── Main Two-Column Layout ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '1.5rem',
          alignItems: 'start',
        }}>

          {/* Left: Info Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeInUp 0.6s ease-out' }}>
            {/* Shield Badge */}
            <div style={{
              background: 'var(--header-bg)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              textAlign: 'center',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto 1.25rem' }}>
                <Image src="/verification-shield.png" alt="Verified" fill style={{ objectFit: 'contain' }} />
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '4px' }}>CampusHelper Certified</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>You're in the top 5% of students applying to help</div>
            </div>

            {/* Steps */}
            <div style={{
              background: 'var(--card-bg)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                What to fill in
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {[
                  { title: "Your Headline", desc: "A short title describing your expertise" },
                  { title: "Your Rate (GHS/hr)", desc: "Set your hourly compensation" },
                  { title: "Your Bio", desc: "Background, experience, and skills" },
                  { title: "Your Courses", desc: "Subjects you can teach" },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: 'rgba(0, 126, 167, 0.1)',
                      color: 'var(--btn-bg)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>{item.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tip Card */}
            <div style={{
              background: 'rgba(0, 126, 167, 0.06)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              border: '1px solid rgba(0, 126, 167, 0.12)',
            }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--btn-bg)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ArrowRight size={14} /> Pro Tip
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                Helpers with a detailed bio and multiple course listings receive <strong>3× more requests</strong> than those without.
              </p>
            </div>
          </div>

          {/* Right: Form */}
          <div style={{ animation: 'fadeInUp 0.7s ease-out' }}>
            <ProfileSetupForm 
              onSuccess={() => router.push("/dashboard")}
              initialData={{
                headline: user.helperProfile?.headline || undefined,
                bio: user.helperProfile?.bio || undefined,
                hourlyRate: user.helperProfile?.hourlyRate || undefined,
              }}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
