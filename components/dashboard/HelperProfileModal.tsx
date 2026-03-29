"use client"

import { useRouter } from "next/navigation"
import { trpc } from "@/trpc/client"
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog"
import { Star, Clock, BookOpen, MessageSquare, ShieldCheck, ArrowRight, User, X } from "lucide-react"

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
        <DialogContent showCloseButton={false} className="sm:max-w-[400px] bg-[var(--card-bg)] border-none p-12 text-center rounded-[32px] shadow-2xl outline-none">
          <div className="flex flex-col items-center justify-center gap-5">
            <div className="relative flex items-center justify-center w-16 h-16">
              <div className="absolute inset-0 border-[3px] border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-[3px] border-[var(--chart-2)] border-b-transparent rounded-full animate-spin animation-delay-200" style={{ animationDirection: "reverse" }}></div>
            </div>
            <p className="text-[var(--text-muted)] font-bold text-sm tracking-wide animate-pulse">Loading expert profile...</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!helper) return null

  const getInitials = (name: string) => name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "H"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-[700px] bg-[var(--card-bg)] border border-[var(--border-color)]/50 p-0 overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] rounded-[32px] outline-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        
        {/* Custom Close Button to prevent overlap */}
        <DialogClose className="absolute top-5 right-5 z-50 rounded-full w-9 h-9 bg-black/5 dark:bg-white/10 backdrop-blur-md flex items-center justify-center text-[var(--text-main)] hover:bg-[var(--primary)] hover:text-white transition-all cursor-pointer border border-[var(--border-color)]/30 hover:rotate-90 duration-300">
            <X size={18} strokeWidth={2.5} />
            <span className="sr-only">Close</span>
        </DialogClose>

        {/* Dynamic Header Background Glow */}
        <div className="absolute top-0 left-0 right-0 h-[180px] bg-gradient-to-br from-[var(--primary)]/15 via-[var(--chart-2)]/5 to-transparent dark:from-[var(--primary)]/20 dark:via-transparent pointer-events-none"></div>

        <div className="relative p-10 flex flex-col gap-8">
          
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              {/* Avatar Box with Glow */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[var(--primary)] to-[var(--chart-2)] rounded-[26px] blur-md opacity-30 group-hover:opacity-50 transition duration-500"></div>
                <div className="relative w-[100px] h-[100px] rounded-[24px] bg-[var(--bg-color)] border-[2px] border-white/10 dark:border-white/5 flex items-center justify-center text-4xl font-black text-[var(--primary)] shadow-xl overflow-hidden flex-shrink-0">
                  {helper.user?.name ? getInitials(helper.user.name) : <User size={40} />}
                </div>
              </div>

              {/* Identity & Status */}
              <div className="flex flex-col mt-2 sm:mt-0">
                <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                  <h2 className="text-[2rem] font-black tracking-tight text-[var(--text-main)] leading-none">{helper.user?.name}</h2>
                  <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-widest shadow-sm">
                    <ShieldCheck size={14} /> Verified
                  </div>
                </div>
                <p className="text-[var(--primary)] font-extrabold text-[0.95rem] tracking-wide mb-3">{helper.headline || "Verified Expert"}</p>
                <div className="flex flex-wrap items-center gap-4 text-[var(--text-muted)] text-[0.8rem] font-bold">
                  <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-[8px] border border-amber-500/20">
                    <Star size={14} className="fill-amber-500 text-amber-500" />
                    <span>5.0</span>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-80">
                    <Clock size={16} />
                    <span>Usually responds in 1h</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Price Tag */}
            <div className="flex flex-col bg-[var(--sidebar)]/80 backdrop-blur-md px-6 py-4 rounded-[20px] border border-[var(--border-color)]/60 shadow-sm transition-transform hover:-translate-y-1 block sm:self-center shrink-0">
              <div className="text-[var(--text-muted)] text-[0.65rem] font-black uppercase tracking-[0.2em] mb-1">Hourly Rate</div>
              <div className="text-3xl font-black text-[var(--text-main)] flex items-baseline gap-1">
                <span className="text-[var(--primary)] text-xl opacity-80">₵</span>
                {helper.hourlyRate?.toFixed(2) || "0.00"}
              </div>
            </div>
          </div>

          <hr className="border-[var(--border-color)]/40" />

          {/* Bio Section */}
          <div className="group space-y-3 p-6 rounded-[24px] bg-[var(--bg-color)]/50 border border-[var(--border-color)]/30 transition-all hover:bg-[var(--bg-color)] hover:border-[var(--border-color)]/60">
            <h3 className="text-[0.7rem] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] flex items-center gap-2 group-hover:text-[var(--primary)] transition-colors">
              About Me
            </h3>
            <p className="text-[var(--text-main)] font-semibold leading-[1.8] text-[0.95rem] opacity-90">
              {helper.bio || "This expert hasn't provided a professional bio yet."}
            </p>
          </div>

          {/* Expertise Section */}
          <div className="space-y-4">
            <h3 className="text-[0.7rem] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] ml-2 flex items-center gap-2">
              Areas of Expertise
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {helper.expertise && helper.expertise.length > 0 ? (
                helper.expertise.map((course) => (
                  <div 
                    key={course.id} 
                    className="bg-[var(--sidebar)] border border-[var(--border-color)]/60 px-4 py-3 rounded-[18px] flex items-center gap-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:border-[var(--primary)]/50 hover:shadow-[0_8px_20px_-6px_color-mix(in srgb, var(--primary) 20%, transparent)] hover:bg-[var(--card-bg)] hover:-translate-y-1 transition-all duration-300 cursor-default group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[var(--bg-color)] text-[var(--primary)] flex flex-shrink-0 items-center justify-center border border-[var(--border-color)]/50 group-hover:bg-[var(--primary)] group-hover:text-white group-hover:border-transparent transition-all duration-300">
                      <BookOpen size={16} strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0 pr-2">
                      <div className="font-black text-[0.95rem] tracking-tight text-[var(--text-main)] truncate">{course.code}</div>
                      <div className="text-[0.7rem] font-bold text-[var(--text-muted)] truncate mt-0.5 uppercase tracking-wider">{course.name}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-5 py-3 col-span-1 sm:col-span-2 bg-[var(--bg-color)] rounded-[18px] text-[var(--text-muted)] text-[0.85rem] font-bold border border-[var(--border-color)]/50 border-dashed flex items-center justify-center">
                  General Academic Support
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-4 pt-6 mt-2 border-t border-[var(--border-color)]/40 relative">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-30"></div>
            
            <button 
              className="flex-1 bg-gradient-to-r from-[var(--primary)] to-[var(--chart-2)] focus:ring-4 focus:ring-[var(--primary)]/20 text-white font-extrabold h-[60px] rounded-[20px] text-lg shadow-[0_10px_25px_-5px_color-mix(in srgb, var(--primary) 40%, transparent)] hover:shadow-[0_15px_30px_-5px_color-mix(in srgb, var(--primary) 60%, transparent)] hover:-translate-y-1 transition-all outline-none flex items-center justify-center gap-3"
              onClick={onBook}
            >
              Book Session
              <div className="bg-white/20 p-1.5 rounded-full inline-flex">
                <ArrowRight size={18} strokeWidth={3} />
              </div>
            </button>
            <button 
              className="w-[60px] h-[60px] border-2 border-[var(--border-color)]/70 bg-[var(--bg-color)] hover:bg-[var(--primary)] hover:border-[var(--primary)] text-[var(--text-muted)] hover:text-white rounded-[20px] shadow-[0_5px_15px_-5px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_20px_-5px_color-mix(in srgb, var(--primary) 30%, transparent)] hover:-translate-y-1 transition-all outline-none flex items-center justify-center flex-shrink-0 group"
              onClick={() => router.push(`/messages?userId=${helperId}`)}
              title="Message Expert"
            >
              <MessageSquare size={24} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
