"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { trpc } from "@/trpc/client"
import { toast } from "sonner"
import { Check, X, Search, DollarSign, BookOpen, User, Briefcase, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

const profileSchema = z.object({
  headline: z.string().min(1, "Headline is required").max(100),
  bio: z.string().min(10, "Bio must be at least 10 characters").max(1000),
  hourlyRate: z.number().min(0, "Rate cannot be negative"),
  courseIds: z.array(z.string()).min(1, "Select at least one course"),
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface ProfileSetupFormProps {
  onSuccess?: () => void
  initialData?: {
    headline?: string
    bio?: string
    hourlyRate?: number
    courseIds?: string[]
  }
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: '12px',
  border: '1.5px solid var(--border-color)',
  background: 'var(--bg-color)',
  fontSize: '0.9rem',
  fontWeight: 500,
  color: 'var(--text-main)',
  outline: 'none',
  transition: 'all 0.2s',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 700,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '8px',
}

const sectionCardStyle: React.CSSProperties = {
  background: 'var(--card-bg)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--border-color)',
  boxShadow: 'var(--shadow-sm)',
  overflow: 'hidden',
  marginBottom: '1.25rem',
}

const sectionHeaderStyle: React.CSSProperties = {
  padding: '1rem 1.5rem',
  borderBottom: '1px solid var(--border-color)',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '0.85rem',
  fontWeight: 700,
  color: 'var(--btn-bg)',
  background: 'rgba(0, 126, 167, 0.04)',
}

export function ProfileSetupForm({ onSuccess, initialData }: ProfileSetupFormProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const utils = trpc.useUtils()

  const { data: courses = [] } = trpc.courses.list.useQuery()
  const updateProfile = trpc.helpers.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile published successfully!")
      utils.users.me.invalidate()
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile")
    },
  })

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      headline: initialData?.headline || "",
      bio: initialData?.bio || "",
      hourlyRate: initialData?.hourlyRate || 0,
      courseIds: initialData?.courseIds || [],
    },
  })

  const selectedCourseIds = form.watch("courseIds")
  const bioValue = form.watch("bio")

  const toggleCourse = (courseId: string) => {
    const current = form.getValues("courseIds")
    if (current.includes(courseId)) {
      form.setValue("courseIds", current.filter(id => id !== courseId))
    } else {
      form.setValue("courseIds", [...current, courseId])
    }
  }

  const filteredCourses = courses.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const onSubmit = (values: ProfileFormValues) => {
    updateProfile.mutate(values)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      
      {/* Section 1: Basic Info */}
      <div style={sectionCardStyle}>
        <div style={sectionHeaderStyle}>
          <Briefcase size={16} /> Basic Information
        </div>
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div>
            <label style={labelStyle}>Professional Headline</label>
            <input
              placeholder="e.g. CS Tutor & Fullstack Developer"
              style={inputStyle}
              {...form.register("headline")}
            />
            {form.formState.errors.headline && (
              <p style={{ color: '#e11d48', fontSize: '0.78rem', marginTop: '6px', fontWeight: 600 }}>{form.formState.errors.headline.message}</p>
            )}
          </div>

          <div>
            <label style={labelStyle}>Hourly Rate (GHS)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 800, fontSize: '1rem' }}>₵</span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                style={{ ...inputStyle, paddingLeft: '36px', fontWeight: 700 }}
                {...form.register("hourlyRate", { valueAsNumber: true })}
              />
            </div>
            {form.formState.errors.hourlyRate && (
              <p style={{ color: '#e11d48', fontSize: '0.78rem', marginTop: '6px', fontWeight: 600 }}>{form.formState.errors.hourlyRate.message}</p>
            )}
          </div>

        </div>
      </div>

      {/* Section 2: Bio */}
      <div style={sectionCardStyle}>
        <div style={sectionHeaderStyle}>
          <User size={16} /> About You
        </div>
        <div style={{ padding: '1.5rem' }}>
          <label style={labelStyle}>Professional Bio</label>
          <textarea
            rows={5}
            placeholder="Tell students about your background, academic achievements, study style, and how you can help them succeed..."
            style={{ ...inputStyle, padding: '14px 16px', resize: 'none', lineHeight: 1.7 }}
            {...form.register("bio")}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            {form.formState.errors.bio
              ? <p style={{ color: '#e11d48', fontSize: '0.78rem', fontWeight: 600 }}>{form.formState.errors.bio.message}</p>
              : <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Be detailed — students read this before booking.</p>
            }
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', flexShrink: 0 }}>{bioValue.length}/1000</p>
          </div>
        </div>
      </div>

      {/* Section 3: Courses */}
      <div style={sectionCardStyle}>
        <div style={sectionHeaderStyle}>
          <BookOpen size={16} /> Areas of Expertise
        </div>
        <div style={{ padding: '1.5rem' }}>
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
            <input
              placeholder="Search courses by name or code..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ ...inputStyle, paddingLeft: '42px' }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--btn-bg)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 126, 167, 0.08)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'none' }}
            />
          </div>

          {/* Course List */}
          <div style={{
            border: '1.5px solid var(--border-color)',
            borderRadius: '12px',
            background: 'var(--bg-color)',
            height: '200px',
            overflowY: 'auto',
            padding: '8px',
          }}>
            {filteredCourses.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {filteredCourses.map(course => {
                  const isSelected = selectedCourseIds.includes(course.id)
                  return (
                    <div
                      key={course.id}
                      onClick={() => toggleCourse(course.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        border: `1.5px solid ${isSelected ? 'var(--btn-bg)' : 'transparent'}`,
                        background: isSelected ? 'rgba(0, 126, 167, 0.08)' : 'var(--card-bg)',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: isSelected ? 'var(--btn-bg)' : 'var(--text-main)' }}>{course.code}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '1px' }}>{course.name}</div>
                      </div>
                      {isSelected && <Check size={15} color="var(--btn-bg)" />}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '8px' }}>
                <BookOpen size={24} style={{ opacity: 0.3 }} />
                <span style={{ fontSize: '0.85rem' }}>No courses found</span>
              </div>
            )}
          </div>

          {/* Selected Tags */}
          {selectedCourseIds.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Selected ({selectedCourseIds.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedCourseIds.map(id => {
                  const course = courses.find(c => c.id === id)
                  if (!course) return null
                  return (
                    <div
                      key={id}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'rgba(0, 126, 167, 0.1)',
                        color: 'var(--btn-bg)',
                        padding: '5px 12px',
                        borderRadius: '9999px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        border: '1px solid rgba(0, 126, 167, 0.2)',
                      }}
                    >
                      {course.code}
                      <X
                        size={13}
                        style={{ cursor: 'pointer', flexShrink: 0, opacity: 0.7 }}
                        onClick={e => { e.stopPropagation(); toggleCourse(id) }}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {form.formState.errors.courseIds && (
            <p style={{ color: '#e11d48', fontSize: '0.78rem', marginTop: '8px', fontWeight: 600 }}>{form.formState.errors.courseIds.message}</p>
          )}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={updateProfile.isPending}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: '16px',
          background: 'var(--btn-bg)',
          color: 'white',
          fontWeight: 800,
          fontSize: '1rem',
          border: 'none',
          cursor: updateProfile.isPending ? 'not-allowed' : 'pointer',
          opacity: updateProfile.isPending ? 0.7 : 1,
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: '0 8px 20px rgba(0, 126, 167, 0.25)',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
        onMouseEnter={e => { if (!updateProfile.isPending) { e.currentTarget.style.background = 'var(--btn-bg-hover)'; e.currentTarget.style.transform = 'translateY(-2px)' } }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--btn-bg)'; e.currentTarget.style.transform = 'translateY(0)' }}
      >
        {updateProfile.isPending ? "Publishing..." : (
          <>
            Publish My Profile <ArrowUpRight size={18} />
          </>
        )}
      </button>
    </form>
  )
}
