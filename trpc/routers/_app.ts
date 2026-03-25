import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { adminProcedure, baseProcedure, helperProcedure, createTRPCRouter, protectedProcedure } from '../init';
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
          where: { id: ctx.session.user.id },
          include: { helperProfile: true }
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

    becomeHelper: protectedProcedure
      .mutation(async ({ ctx }) => {
        // Create profile if doesn't exist
        const profile = await prisma.helperProfile.upsert({
          where: { userId: ctx.session.user.id },
          update: { verificationStatus: 'PENDING' },
          create: {
            userId: ctx.session.user.id,
            verificationStatus: 'PENDING',
          }
        });

        // Note: We deliberately do NOT update the user role to 'HELPER' here anymore.
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
        return await prisma.course.findMany({ orderBy: { code: 'asc' } });
      }),

    create: adminProcedure
      .input(z.object({ code: z.string(), name: z.string(), description: z.string().optional() }))
      .mutation(async ({ input }) => {
        return await prisma.course.create({
          data: input,
        });
      }),

    delete: adminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await prisma.course.delete({ where: { id: input.id } });
        return { success: true };
      }),

    update: adminProcedure
      .input(z.object({ id: z.string(), code: z.string(), name: z.string(), description: z.string().optional() }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await prisma.course.update({ where: { id }, data });
      }),
  }),

  // ── Help Requests ──────────────────────────────────────────────────────────
  helpRequests: createTRPCRouter({
    list: baseProcedure
      .input(z.object({
        status: z.nativeEnum(HelpRequestStatus).optional(),
        studentId: z.string().optional(),
        helperId: z.string().optional(),
        courseId: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await prisma.helpRequest.findMany({
          where: {
            status: input?.status,
            studentId: input?.studentId,
            acceptedById: input?.helperId,
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
        // Helpers can accept/decline if they aren't the student.
        const dbUser = await prisma.user.findUnique({ where: { id: ctx.session.user.id } });
        if (!dbUser) throw new TRPCError({ code: 'UNAUTHORIZED' });

        const isAdmin = dbUser.role === 'ADMIN';
        const isOwner = request.studentId === dbUser.id;
        const isHelper = dbUser.role === 'HELPER';

        // Role-based state transitions
        if (isAdmin) {
          // Admins can do anything
        } else if (isHelper && (input.status === 'ACCEPTED' || input.status === 'DECLINED' || input.status === 'COMPLETED')) {
          // Helpers can accept, decline, or complete requests
        } else if (isOwner && input.status === 'CANCELLED') {
          // Students can only cancel their own requests
        } else {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized to perform this action' });
        }

        if (isHelper && input.status === 'ACCEPTED') {
          // When a helper accepts, assign them to the request
          return await prisma.helpRequest.update({
            where: { id: input.id },
            data: { 
              status: input.status,
              acceptedById: dbUser.id
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
        helperId: z.string().optional(),
        studentId: z.string().optional(),
        status: z.nativeEnum(SessionStatus).optional(),
      }).optional())
      .query(async ({ input }) => {
        return await prisma.academicSession.findMany({
          where: {
            helperId: input?.helperId,
            studentId: input?.studentId,
            status: input?.status,
          },
          include: {
            request: {
              include: { course: true }
            },
            student: true,
            helper: true,
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
            helper: true,
          },
        });
        if (!session) throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' });
        return session;
      }),

    create: protectedProcedure
      .input(z.object({
        requestId: z.string(),
        studentId: z.string(),
        helperId: z.string(),
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

        const isParticipant = session.studentId === ctx.session.user.id || session.helperId === ctx.session.user.id;
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
        return await prisma.helperProfile.findMany({
          where: {
            verificationStatus: 'APPROVED',
            expertise: input?.courseId ? { some: { id: input.courseId } } : undefined,
          },
          include: {
            user: true,
            expertise: true,
          },
        });
      }),

    getProfile: baseProcedure
      .input(z.object({ userId: z.string() }))
      .query(async ({ input }) => {
        const profile = await prisma.helperProfile.findUnique({
          where: { userId: input.userId },
          include: {
            user: true,
            expertise: true,
          },
        });
        if (!profile) throw new TRPCError({ code: 'NOT_FOUND' });
        return profile;
      }),

    updateProfile: helperProcedure
      .input(z.object({
        headline: z.string().min(1).max(100),
        bio: z.string().min(10).max(1000),
        hourlyRate: z.number().min(0),
        courseIds: z.array(z.string()),
      }))
      .mutation(async ({ input, ctx }) => {
        const profile = await prisma.helperProfile.findUnique({ 
            where: { userId: ctx.session.user.id } 
        });
        if (!profile) throw new TRPCError({ code: 'NOT_FOUND' });

        return await prisma.helperProfile.update({
          where: { userId: ctx.session.user.id },
          data: {
            headline: input.headline,
            bio: input.bio,
            hourlyRate: input.hourlyRate,
            completedProfile: true,
            expertise: {
              set: input.courseIds.map(id => ({ id })),
            },
          },
        });
      }),

    setCourses: helperProcedure
      .input(z.object({ helperId: z.string(), courseIds: z.array(z.string()) }))
      .mutation(async ({ input, ctx }) => {
        const profile = await prisma.helperProfile.findUnique({ where: { id: input.helperId } });
        if (!profile) throw new TRPCError({ code: 'NOT_FOUND' });
        
        if (profile.userId !== ctx.session.user.id && (ctx.session.user as any).role !== 'ADMIN') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }

        return await prisma.helperProfile.update({
          where: { id: input.helperId },
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
      .input(z.object({ helperId: z.string() }))
      .query(async ({ input }) => {
        return await prisma.availabilitySlot.findMany({
          where: { helperId: input.helperId },
        });
      }),

    create: protectedProcedure
      .input(z.object({
        helperId: z.string(),
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

    delete: helperProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const slot = await prisma.availabilitySlot.findUnique({
          where: { id: input.id },
          include: { helper: true }
        });
        if (!slot) throw new TRPCError({ code: 'NOT_FOUND' });

        if (slot.helper.userId !== ctx.session.user.id && (ctx.session.user as any).role !== 'ADMIN') {
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
        partnerId: z.string().optional(),
      }))
      .query(async ({ input, ctx }) => {
        return await prisma.message.findMany({
          where: {
            requestId: input.requestId,
            sessionId: input.sessionId,
            AND: input.partnerId ? [
              {
                OR: [
                  { senderId: ctx.session.user.id, recipientId: input.partnerId },
                  { senderId: input.partnerId, recipientId: ctx.session.user.id },
                ]
              }
            ] : [
              {
                OR: [
                  { senderId: ctx.session.user.id },
                  { recipientId: ctx.session.user.id },
                ]
              }
            ],
          },
          orderBy: { sentAt: 'asc' },
        });
      }),

    listConversations: protectedProcedure
      .query(async ({ ctx }) => {
        const userId = ctx.session.user.id;
        
        // Get all messages where user is sender or recipient
        const messages = await prisma.message.findMany({
          where: {
            OR: [{ senderId: userId }, { recipientId: userId }],
          },
          include: {
            sender: true,
            recipient: true,
          },
          orderBy: { sentAt: 'desc' },
        });

        const conversationsMap = new Map<string, { partner: any, lastMessage: any }>();
        
        for (const msg of messages) {
          const partnerId = msg.senderId === userId ? msg.recipientId : msg.senderId;
          if (!conversationsMap.has(partnerId)) {
            conversationsMap.set(partnerId, {
              partner: msg.senderId === userId ? msg.recipient : msg.sender,
              lastMessage: msg,
            });
          }
        }

        return Array.from(conversationsMap.values());
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
                { helperId: input.userId },
              ],
            },
          },
          include: {
            session: {
              include: {
                student: true,
                helper: true,
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
        helperId: z.string().optional(),
        status: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await prisma.payment.findMany({
          where: {
            studentId: input?.studentId,
            helperId: input?.helperId,
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
        helperId: z.string(),
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
        return await prisma.helperProfile.upsert({
          where: { userId: ctx.session.user.id },
          update: { verificationStatus: 'PENDING' },
          create: {
            userId: ctx.session.user.id,
            verificationStatus: 'PENDING',
          },
        });
      }),

    submitDetails: protectedProcedure
      .input(z.object({
        idFrontUrl: z.string().optional(),
        idBackUrl: z.string().optional(),
        transcriptUrl: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // 1. Create the verification request for admin review
        const request = await prisma.verificationRequest.create({
          data: {
            ...input,
            userId: ctx.session.user.id,
            status: 'PENDING',
          },
        });

        // 2. Ensuring HelperProfile exists so they show up in searches (as Pending)
        await prisma.helperProfile.upsert({
          where: { userId: ctx.session.user.id },
          update: { verificationStatus: 'PENDING' },
          create: {
            userId: ctx.session.user.id,
            verificationStatus: 'PENDING',
          }
        });

        return request;
      }),

    list: adminProcedure
      .input(z.object({ status: z.string().optional() }))
      .query(async ({ input }) => {
        return await prisma.helperProfile.findMany({
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
        return await prisma.helperProfile.update({
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
  // ── Verification Queue ────────────────────────────────────────────────────
  verificationQueue: createTRPCRouter({
    list: adminProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return await prisma.verificationRequest.findMany({
          where: input?.status ? { status: input.status } : undefined,
          include: { user: true },
          orderBy: { createdAt: 'desc' },
        });
      }),

    review: adminProcedure
      .input(z.object({
        id: z.string(),
        status: z.enum(['APPROVED', 'REJECTED']),
        reviewerNote: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const req = await prisma.verificationRequest.update({
          where: { id: input.id },
          data: { status: input.status, reviewerNote: input.reviewerNote, reviewedAt: new Date() },
          include: { user: true },
        });
        // If approved, promote user to HELPER role and update profile
        if (input.status === 'APPROVED') {
          await prisma.user.update({
            where: { id: req.userId },
            data: { role: 'HELPER' },
          });

          // Ensure HelperProfile exists and is approved
          await prisma.helperProfile.upsert({
            where: { userId: req.userId },
            update: { verificationStatus: 'APPROVED' },
            create: {
              userId: req.userId,
              verificationStatus: 'APPROVED',
            }
          });
        }
        return req;
      }),
  }),
});

export type AppRouter = typeof appRouter;
