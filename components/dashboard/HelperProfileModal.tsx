"use client"

import { useRouter } from "next/navigation"
import { trpc } from "@/trpc/client"
import { toast } from "sonner"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Star, Clock, BookOpen, MessageSquare, ShieldCheck, ArrowRight, User } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface HelperProfileModalProps {
  helperId: string
  isOpen: boolean
  onClose: () => void
  onBook: () => void
}

export function HelperProfileModal({ helperId, isOpen, onClose, onBook }: HelperProfileModalProps) {
  const router = useRouter()
  const { data: helper, isLoading } = trpc.helpers.getProfile.useQuery(
    { userId: helperId },
    { enabled: isOpen && !!helperId }
  )

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[650px] bg-[var(--card-bg)] border-[var(--border-color)] p-12 text-center rounded-[24px]">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-t-[var(--primary)] border-[var(--primary)]/20 rounded-full animate-spin" />
            <p className="text-[var(--text-muted)] font-semibold text-sm animate-pulse">Loading expert profile...</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!helper) return null

  const getInitials = (name: string) => name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "H"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[750px] bg-[var(--card-bg)] border-[var(--border-color)] p-0 overflow-hidden shadow-2xl rounded-[24px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        
        <div className="p-10 flex flex-col gap-10">
          
          {/* Header Info (Avatar, Name, Rate) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-5">
              <div className="w-[84px] h-[84px] rounded-[20px] bg-[var(--header-bg)] border border-[color-mix(in srgb, var(--primary) 15%, transparent)] flex items-center justify-center text-3xl font-extrabold text-[var(--chart-3)] shadow-sm flex-shrink-0">
                {helper.user?.name ? getInitials(helper.user.name) : <User size={36} />}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-main)] m-0 leading-none">{helper.user?.name}</h2>
                  <div className="bg-[rgba(16,185,129,0.1)] text-[#059669] px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-wider">
                    <ShieldCheck size={12} /> Verified
                  </div>
                </div>
                <p className="text-[var(--primary)] font-bold text-sm mb-2">{helper.headline || "Verified Expert"}</p>
                <div className="flex items-center gap-3 text-[var(--text-muted)] text-xs font-semibold">
                  <div className="flex items-center gap-1.5 bg-[color-mix(in srgb, #f59e0b 10%, var(--background))] text-[#b45309] px-2 py-0.5 rounded-md">
                    <Star size={12} className="fill-[#f59e0b] text-[#f59e0b]" />
                    <span>5.0</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    <span>Usually responds in 1h</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-left md:text-right bg-[var(--sidebar)] p-4 rounded-[16px] border border-[var(--border-color)]">
              <div className="text-[var(--text-muted)] text-[0.65rem] font-extrabold uppercase tracking-widest mb-1">Hourly Rate</div>
              <div className="text-2xl font-black text-[var(--text-main)] flex items-baseline md:justify-end gap-1">
                <span className="text-[var(--primary)] text-lg">₵</span>
                {helper.hourlyRate?.toFixed(2) || "0.00"}
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="space-y-3 p-5 rounded-[16px] bg-[var(--bg-color)] border border-[var(--border-color)]/50">
            <h3 className="text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--primary)] flex items-center gap-2">
              About Me
            </h3>
            <p className="text-[var(--text-muted)] font-medium leading-[1.7] text-[0.95rem]">
              {helper.bio || "No professional bio provided yet."}
            </p>
          </div>

          {/* Expertise Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--text-muted)] flex items-center gap-2">
              Areas of Expertise
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {helper.expertise && helper.expertise.length > 0 ? (
                helper.expertise.map((course) => (
                  <div 
                    key={course.id} 
                    className="bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-main)] p-3 rounded-[14px] flex items-center gap-3 shadow-sm hover:border-[var(--primary)] hover:shadow-md transition-all cursor-default group"
                  >
                    <div className="w-8 h-8 rounded-[10px] bg-[color-mix(in srgb, var(--primary) 8%, transparent)] text-[var(--primary)] flex items-center justify-center group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm">{course.code}</div>
                      <div className="text-[0.7rem] text-[var(--text-muted)] font-semibold mt-0.5">{course.name}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 bg-[var(--bg-color)] rounded-xl text-[var(--text-muted)] text-sm font-semibold border border-[var(--border-color)]">
                  General Academic Support
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-[var(--border-color)]">
            <button 
              className="flex-1 bg-[var(--btn-bg)] hover:bg-[var(--btn-bg-hover)] text-white font-extrabold h-[56px] rounded-[16px] shadow-[0_8px_20px_color-mix(in srgb, var(--primary) 25%, transparent)] hover:shadow-[0_12px_24px_color-mix(in srgb, var(--primary) 35%, transparent)] hover:-translate-y-0.5 transition-all outline-none flex items-center justify-center gap-2"
              onClick={onBook}
            >
              Book Session Now
              <ArrowRight size={18} />
            </button>
            <button 
              className="px-6 border border-[var(--border-color)] bg-[var(--card-bg)] hover:bg-[var(--bg-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] h-[56px] rounded-[16px] shadow-sm transition-all outline-none flex items-center justify-center"
              onClick={() => router.push(`/messages?userId=${helperId}`)}
            >
              <MessageSquare size={22} />
            </button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
