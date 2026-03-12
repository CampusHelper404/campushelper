import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { adminProcedure, baseProcedure, consultantProcedure, createTRPCRouter, protectedProcedure } from '../init';
import { prisma } from '@/lib/prisma';
import { HelpRequestStatus, SessionStatus, UserRole } from '@/lib/generated/prisma/client';

function err(e: unknown) {
  return (e as Error).message;
}

export const appRouter = createTRPCRouter({
  // ── Auth ───────────────────────────────────────────────────────────────────
  // Note: Most auth is handled directly by better-auth, but we keep these for compatibility
  auth: createTRPCRouter({
    me: protectedProcedure
      .query(async ({ ctx }) => {
        return ctx.session.user;
      }),

    logout: baseProcedure
      .mutation(() => {
        // Sign out is handled by the better-auth client
        return { success: true };
      }),
  }),

  // ── Users ──────────────────────────────────────────────────────────────────
  users: createTRPCRouter({
    me: protectedProcedure
      .query(async ({ ctx }) => {
        return await prisma.user.findUnique({
          where: { id: ctx.session.user.id }
        });
      }),

    updateMe: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        image: z.string().optional(),
        // role is removed to prevent self-escalation
      }))
      .mutation(async ({ input, ctx }) => {
        return await prisma.user.update({
          where: { id: ctx.session.user.id },
          data: input,
        });
      }),

    setOnboarded: protectedProcedure
      .mutation(async ({ ctx }) => {
        return await prisma.user.update({
          where: { id: ctx.session.user.id },
          data: { onboarded: true },
        });
      }),

    becomeConsultant: protectedProcedure
      .mutation(async ({ ctx }) => {
        // Create profile if doesn't exist
        const profile = await prisma.consultantProfile.upsert({
          where: { userId: ctx.session.user.id },
          update: { verificationStatus: 'PENDING' },
          create: {
            userId: ctx.session.user.id,
            verificationStatus: 'PENDING',
          }
        });

        // Note: We deliberately do NOT update the user role to 'CONSULTANT' here anymore.
        // They must remain a STUDENT until an admin approves them via the verification queue.
        return profile;
      }),

    getById: baseProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const user = await prisma.user.findUnique({
          where: { id: input.id }
        });
        if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
        return user;
      }),

    list: adminProcedure
      .query(async () => {
        return await prisma.user.findMany();
      }),
  }),

  // ── Courses ────────────────────────────────────────────────────────────────
  courses: createTRPCRouter({
    list: baseProcedure
      .query(async () => {
        return await prisma.course.findMany();
      }),

    create: adminProcedure
      .input(z.object({ code: z.string(), name: z.string(), description: z.string().optional() }))
      .mutation(async ({ input }) => {
        return await prisma.course.create({
          data: input,
        });
      }),
  }),

  // ── Help Requests ──────────────────────────────────────────────────────────
  helpRequests: createTRPCRouter({
    list: baseProcedure
      .input(z.object({
        status: z.nativeEnum(HelpRequestStatus).optional(),
        studentId: z.string().optional(),
        courseId: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await prisma.helpRequest.findMany({
          where: {
            status: input?.status,
            studentId: input?.studentId,
            courseId: input?.courseId,
          },
          include: {
            course: true,
            student: true,
            acceptedBy: true,
          },
        });
      }),

    getById: baseProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const request = await prisma.helpRequest.findUnique({
          where: { id: input.id },
          include: {
            course: true,
            student: true,
          },
        });
        if (!request) throw new TRPCError({ code: 'NOT_FOUND', message: 'Request not found' });
        return request;
      }),

    create: protectedProcedure
      .input(z.object({
        courseId: z.string().optional(),
        title: z.string().min(1),
        description: z.string().optional(),
        preferredDate: z.date().optional(),
        preferredTime: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await prisma.helpRequest.create({
          data: {
            ...input,
            studentId: ctx.session.user.id,
          },
        });
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.string(),
        status: z.nativeEnum(HelpRequestStatus),
      }))
      .mutation(async ({ input, ctx }) => {
        const request = await prisma.helpRequest.findUnique({ where: { id: input.id } });
        if (!request) throw new TRPCError({ code: 'NOT_FOUND' });

        // Logic: Students can cancel their own. Admins can do anything. 
        // Consultants can accept/decline if they aren't the student.
        const isAdmin = (ctx.session.user as any).role === 'ADMIN';
        const isOwner = request.studentId === ctx.session.user.id;
        const isConsultant = (ctx.session.user as any).role === 'CONSULTANT';

        if (!isAdmin && !isOwner && !isConsultant) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized to update this request' });
        }

        if (isOwner && input.status !== 'CANCELLED' && !isAdmin) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Students can only cancel their requests' });
        }

        if (isConsultant && input.status === 'ACCEPTED') {
          return await prisma.helpRequest.update({
            where: { id: input.id },
            data: { 
              status: input.status,
              acceptedById: ctx.session.user.id
            },
          });
        }

        return await prisma.helpRequest.update({
          where: { id: input.id },
          data: { status: input.status },
        });
      }),
  }),

  // ── Sessions ───────────────────────────────────────────────────────────────
  sessions: createTRPCRouter({
    list: baseProcedure
      .input(z.object({
        consultantId: z.string().optional(),
        studentId: z.string().optional(),
        status: z.nativeEnum(SessionStatus).optional(),
      }).optional())
      .query(async ({ input }) => {
        return await prisma.academicSession.findMany({
          where: {
            consultantId: input?.consultantId,
            studentId: input?.studentId,
            status: input?.status,
          },
          include: {
            request: {
              include: { course: true }
            },
            student: true,
            consultant: true,
          },
        });
      }),

    getById: baseProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const session = await prisma.academicSession.findUnique({
          where: { id: input.id },
          include: {
            request: {
              include: { course: true }
            },
            student: true,
            consultant: true,
          },
        });
        if (!session) throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' });
        return session;
      }),

    create: protectedProcedure
      .input(z.object({
        requestId: z.string(),
        studentId: z.string(),
        consultantId: z.string(),
        startTime: z.date(),
        endTime: z.date().optional(),
        meetingLink: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await prisma.academicSession.create({
          data: input,
        });
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.string(),
        status: z.nativeEnum(SessionStatus),
      }))
      .mutation(async ({ input, ctx }) => {
        const session = await prisma.academicSession.findUnique({ where: { id: input.id } });
        if (!session) throw new TRPCError({ code: 'NOT_FOUND' });

        const isParticipant = session.studentId === ctx.session.user.id || session.consultantId === ctx.session.user.id;
        const isAdmin = (ctx.session.user as any).role === 'ADMIN';

        if (!isParticipant && !isAdmin) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' });
        }

        return await prisma.academicSession.update({
          where: { id: input.id },
          data: { status: input.status },
        });
      }),
  }),

  // ── Helpers ────────────────────────────────────────────────────────────────
  helpers: createTRPCRouter({
    list: baseProcedure
      .input(z.object({ courseId: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return await prisma.consultantProfile.findMany({
          where: {
            expertise: input?.courseId ? { some: { id: input.courseId } } : undefined,
          },
          include: {
            user: true,
            expertise: true,
          },
        });
      }),

    setCourses: consultantProcedure
      .input(z.object({ consultantId: z.string(), courseIds: z.array(z.string()) }))
      .mutation(async ({ input, ctx }) => {
        const profile = await prisma.consultantProfile.findUnique({ where: { id: input.consultantId } });
        if (!profile) throw new TRPCError({ code: 'NOT_FOUND' });
        
        if (profile.userId !== ctx.session.user.id && (ctx.session.user as any).role !== 'ADMIN') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }

        return await prisma.consultantProfile.update({
          where: { id: input.consultantId },
          data: {
            expertise: {
              set: input.courseIds.map(id => ({ id })),
            },
          },
        });
      }),
  }),

  // ── Availability ───────────────────────────────────────────────────────────
  availability: createTRPCRouter({
    list: baseProcedure
      .input(z.object({ consultantId: z.string() }))
      .query(async ({ input }) => {
        return await prisma.availabilitySlot.findMany({
          where: { consultantId: input.consultantId },
        });
      }),

    create: protectedProcedure
      .input(z.object({
        consultantId: z.string(),
        weekday: z.number().min(0).max(6).optional(),
        startTime: z.string(),
        endTime: z.string(),
        specificDate: z.date().optional(),
        isRecurring: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        return await prisma.availabilitySlot.create({
          data: input,
        });
      }),

    delete: consultantProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const slot = await prisma.availabilitySlot.findUnique({
          where: { id: input.id },
          include: { consultant: true }
        });
        if (!slot) throw new TRPCError({ code: 'NOT_FOUND' });

        if (slot.consultant.userId !== ctx.session.user.id && (ctx.session.user as any).role !== 'ADMIN') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }

        await prisma.availabilitySlot.delete({
          where: { id: input.id },
        });
        return { success: true };
      }),
  }),

  // ── Messages ───────────────────────────────────────────────────────────────
  messages: createTRPCRouter({
    list: protectedProcedure
      .input(z.object({
        requestId: z.string().optional(),
        sessionId: z.string().optional(),
      }))
      .query(async ({ input, ctx }) => {
        return await prisma.message.findMany({
          where: {
            requestId: input.requestId,
            sessionId: input.sessionId,
            OR: [
              { senderId: ctx.session.user.id },
              { recipientId: ctx.session.user.id },
            ],
          },
          orderBy: { sentAt: 'asc' },
        });
      }),

    send: protectedProcedure
      .input(z.object({
        requestId: z.string().optional(),
        sessionId: z.string().optional(),
        recipientId: z.string(),
        content: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        return await prisma.message.create({
          data: {
            ...input,
            senderId: ctx.session.user.id,
          },
        });
      }),
  }),

  // ── Reviews ────────────────────────────────────────────────────────────────
  reviews: createTRPCRouter({
    list: protectedProcedure
      .input(z.object({ userId: z.string() }))
      .query(async ({ input }) => {
        return await prisma.review.findMany({
          where: {
            session: {
              OR: [
                { studentId: input.userId },
                { consultantId: input.userId },
              ],
            },
          },
          include: {
            session: {
              include: {
                student: true,
                consultant: true,
                request: { include: { course: true } },
              },
            },
          },
        });
      }),

    create: protectedProcedure
      .input(z.object({
        sessionId: z.string(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await prisma.review.create({
          data: input,
        });
      }),
  }),

  // ── Notifications ──────────────────────────────────────────────────────────
  notifications: createTRPCRouter({
    list: protectedProcedure
      .input(z.object({ unreadOnly: z.boolean().optional() }))
      .query(async ({ input, ctx }) => {
        return await prisma.notification.findMany({
          where: {
            userId: ctx.session.user.id,
            isRead: input?.unreadOnly ? false : undefined,
          },
          orderBy: { sentAt: 'desc' },
        });
      }),

    markRead: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        return await prisma.notification.update({
          where: { id: input.id },
          data: { isRead: true, readAt: new Date() },
        });
      }),
  }),

  // ── Payments ───────────────────────────────────────────────────────────────
  payments: createTRPCRouter({
    list: protectedProcedure
      .input(z.object({
        studentId: z.string().optional(),
        consultantId: z.string().optional(),
        status: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await prisma.payment.findMany({
          where: {
            studentId: input?.studentId,
            consultantId: input?.consultantId,
            status: input?.status,
          },
          include: {
            session: {
              include: {
                request: { include: { course: true } }
              }
            }
          },
        });
      }),

    create: protectedProcedure
      .input(z.object({
        sessionId: z.string(),
        studentId: z.string(),
        consultantId: z.string(),
        amountCents: z.number().positive(),
        currency: z.string().length(3).optional(),
        status: z.string().optional(),
        provider: z.string().optional(),
        providerPaymentId: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await prisma.payment.create({
          data: input,
        });
      }),
  }),

  // ── Verification ───────────────────────────────────────────────────────────
  verification: createTRPCRouter({
    submit: protectedProcedure
      .mutation(async ({ ctx }) => {
        return await prisma.consultantProfile.update({
          where: { userId: ctx.session.user.id },
          data: { verificationStatus: 'PENDING' },
        });
      }),

    list: adminProcedure
      .input(z.object({ status: z.string().optional() }))
      .query(async ({ input }) => {
        return await prisma.consultantProfile.findMany({
          where: { verificationStatus: input.status },
          include: { user: true },
        });
      }),

    review: adminProcedure
      .input(z.object({
        id: z.string(),
        status: z.string(),
        rejectionReason: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await prisma.consultantProfile.update({
          where: { id: input.id },
          data: {
            verificationStatus: input.status,
            rejectionReason: input.rejectionReason,
          },
        });
      }),
  }),

  // ── Analytics ──────────────────────────────────────────────────────────────
  analytics: createTRPCRouter({
    track: protectedProcedure
      .input(z.object({
        eventType: z.string(),
        sessionId: z.string().optional(),
        requestId: z.string().optional(),
        metadata: z.record(z.string(), z.unknown()).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await prisma.analyticsEvent.create({
          data: {
            ...input,
            userId: ctx.session.user.id,
            metadata: input.metadata as any,
          },
        });
      }),

    summary: protectedProcedure
      .query(async () => {
        const events = await prisma.analyticsEvent.findMany({
          orderBy: { timestamp: 'desc' },
          take: 100,
        });
        return { events };
      }),
  }),

  // ── Admin ──────────────────────────────────────────────────────────────────
  admin: createTRPCRouter({
    announcements: createTRPCRouter({
      list: baseProcedure
        .input(z.object({ role: z.nativeEnum(UserRole).optional() }).optional())
        .query(async ({ input }) => {
          return await prisma.announcement.findMany({
            where: {
              targetRole: input?.role,
              isActive: true,
            },
            orderBy: { createdAt: 'desc' },
          });
        }),
      create: adminProcedure
        .input(z.object({
          title: z.string(),
          content: z.string(),
          targetRole: z.nativeEnum(UserRole).optional(),
          expiresAt: z.date().optional(),
        }))
        .mutation(async ({ input }) => {
          return await prisma.announcement.create({ data: input });
        }),
    }),

    reports: createTRPCRouter({
      list: adminProcedure
        .input(z.object({ status: z.string().optional() }))
        .query(async ({ input }) => {
          return await prisma.report.findMany({
            where: { status: input.status },
            include: { reporter: true, reportedUser: true, session: true },
          });
        }),
      update: adminProcedure
        .input(z.object({ id: z.string(), status: z.string(), adminNote: z.string().optional() }))
        .mutation(async ({ input }) => {
          return await prisma.report.update({
            where: { id: input.id },
            data: { status: input.status, adminNote: input.adminNote },
          });
        }),
    }),

    auditLogs: adminProcedure
      .query(async () => {
        return await prisma.auditLog.findMany({
          orderBy: { timestamp: 'desc' },
          include: { user: true },
          take: 100,
        });
      }),
  }),

  // ── Discovery ──────────────────────────────────────────────────────────────
  discovery: createTRPCRouter({
    departments: createTRPCRouter({
      list: baseProcedure.query(async () => {
        return await prisma.department.findMany({ include: { _count: { select: { courses: true } } } });
      }),
      create: adminProcedure
        .input(z.object({ name: z.string(), description: z.string().optional() }))
        .mutation(async ({ input }) => {
          return await prisma.department.create({ data: input });
        }),
    }),
    skills: createTRPCRouter({
      list: baseProcedure.query(async () => {
        return await prisma.skill.findMany();
      }),
      create: adminProcedure
        .input(z.object({ name: z.string() }))
        .mutation(async ({ input }) => {
          return await prisma.skill.create({ data: input });
        }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
