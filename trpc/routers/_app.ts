import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { paystack } from '@/lib/paystack';
import { adminProcedure, baseProcedure, helperProcedure, createTRPCRouter, protectedProcedure } from '../init';
import { prisma } from '@/lib/prisma';
import { HelpRequestStatus, SessionStatus, UserRole } from '@/lib/generated/prisma/client';

function err(e: unknown) {
  return (e as Error).message;
}

export const appRouter = createTRPCRouter({
  // ── Auth ───────────────────────────────────────────────────────────────────
  auth: createTRPCRouter({
    me: protectedProcedure
      .query(async ({ ctx }) => {
        return ctx.session.user;
      }),

    logout: baseProcedure
      .mutation(() => {
        return { success: true };
      }),
  }),

  // ── Users ──────────────────────────────────────────────────────────────────
  users: createTRPCRouter({
    me: protectedProcedure
      .query(async ({ ctx }) => {
        return await prisma.user.findUnique({
          where: { id: ctx.session.user.id },
          include: { 
            helperProfile: true,
            studentSessions: { include: { payment: true } },
            helperSessions: { include: { payment: true } },
          }
        });
      }),

    updateMe: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        image: z.string().optional(),
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
        const profile = await prisma.helperProfile.upsert({
          where: { userId: ctx.session.user.id },
          update: { verificationStatus: 'PENDING' },
          create: {
            userId: ctx.session.user.id,
            verificationStatus: 'PENDING',
          }
        });
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

    updateUserAdmin: adminProcedure
      .input(z.object({
        id: z.string(),
        role: z.nativeEnum(UserRole).optional(),
        isSuspended: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const updatedUser = await prisma.user.update({
          where: { id: input.id },
          data: {
            role: input.role,
            isSuspended: input.isSuspended,
          },
        });

        if (input.isSuspended === true) {
            await prisma.session.deleteMany({
                where: { userId: input.id }
            });
        }

        return updatedUser;
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
        acceptedById: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const request = await prisma.helpRequest.create({
          data: {
            ...input,
            studentId: ctx.session.user.id,
            status: input.acceptedById ? 'ACCEPTED' : 'PENDING',
          },
        });

        // 🚀 Auto-create session for direct bookings
        if (input.acceptedById) {
             await prisma.academicSession.create({
                 data: {
                     requestId: request.id,
                     studentId: ctx.session.user.id,
                     helperId: input.acceptedById,
                     startTime: input.preferredDate || new Date(),
                     status: 'UPCOMING',
                     notes: input.description,
                 }
             });
        }

        return request;
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.string(),
        status: z.nativeEnum(HelpRequestStatus),
      }))
      .mutation(async ({ input, ctx }) => {
        const request = await prisma.helpRequest.findUnique({ where: { id: input.id } });
        if (!request) throw new TRPCError({ code: 'NOT_FOUND' });

        const dbUser = await prisma.user.findUnique({ where: { id: ctx.session.user.id } });
        if (!dbUser) throw new TRPCError({ code: 'UNAUTHORIZED' });

        const isAdmin = dbUser.role === 'ADMIN';
        const isOwner = request.studentId === dbUser.id;
        const isHelper = dbUser.role === 'HELPER';

        if (isAdmin) {
        } else if (isHelper && (input.status === 'ACCEPTED' || input.status === 'DECLINED' || input.status === 'COMPLETED')) {
        } else if (isOwner && input.status === 'CANCELLED') {
        } else {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized to perform this action' });
        }

        if (isHelper && input.status === 'ACCEPTED') {
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
    list: protectedProcedure
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
            payment: true,
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
            payment: true,
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

    trackJoin: protectedProcedure
      .input(z.object({ sessionId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        return await prisma.sessionJoinLog.create({
          data: {
            sessionId: input.sessionId,
            userId: ctx.session.user.id,
          },
        });
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.string(),
        status: z.nativeEnum(SessionStatus),
        adminNote: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const session = await prisma.academicSession.findUnique({
             where: { id: input.id },
             include: { payment: true }
        });
        if (!session) throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' });

        const isUserParticipant = session.studentId === ctx.session.user.id || session.helperId === ctx.session.user.id;
        const isAdmin = (ctx.session.user as any).role === 'ADMIN';

        if (!isUserParticipant && !isAdmin) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' });
        }

        const isHelper = session.helperId === ctx.session.user.id;
        const isStudent = session.studentId === ctx.session.user.id;

        if (input.status === 'COMPLETED') {
           if (isHelper && !isAdmin) {
             return await prisma.academicSession.update({
               where: { id: input.id },
               data: { status: 'AWAITING_CONFIRMATION' },
             });
           }
           
           if (isStudent || isAdmin) {
             if (session.payoutStatus !== 'RELEASED' && session.payment?.status === 'HELD') {
                await prisma.$transaction([
                    prisma.academicSession.update({
                        where: { id: input.id },
                        data: { status: 'COMPLETED', payoutStatus: 'RELEASED' },
                    }),
                    prisma.helperProfile.update({
                        where: { userId: session.helperId },
                        data: { balance: { increment: session.payment.amountCents / 100 } },
                    })
                ]);
                return { success: true };
             }
           }
        }

        if (input.status === 'CANCELLED' && isStudent && session.payment?.status === 'HELD') {
             return await prisma.academicSession.update({
               where: { id: input.id },
               data: { isDisputed: true, adminReviewNote: input.adminNote || 'Disputed by student' },
             });
        }

        return await prisma.academicSession.update({
          where: { id: input.id },
          data: { 
            status: input.status,
            adminReviewNote: input.adminNote
          },
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
        hourlyRate: z.number().min(10).max(50),
        courseIds: z.array(z.string()),
      }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.session.user.id;

        return await prisma.helperProfile.upsert({
          where: { userId },
          create: {
            userId,
            headline: input.headline,
            bio: input.bio,
            hourlyRate: input.hourlyRate,
            completedProfile: true,
            expertise: {
              connect: input.courseIds.map(id => ({ id })),
            },
            verificationStatus: 'APPROVED', // Since they have helper role to be here
          },
          update: {
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

        const conversationsMap = new Map<string, { partner: any, lastMessage: any, unreadCount: number }>();
        for (const msg of messages) {
          const partnerId = msg.senderId === userId ? msg.recipientId : msg.senderId;
          const isUnread = msg.recipientId === userId && msg.readAt === null;

          if (!conversationsMap.has(partnerId)) {
            conversationsMap.set(partnerId, {
              partner: msg.senderId === userId ? msg.recipient : msg.sender,
              lastMessage: msg,
              unreadCount: isUnread ? 1 : 0,
            });
          } else {
            if (isUnread) {
                conversationsMap.get(partnerId)!.unreadCount += 1;
            }
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
        const userId = ctx.session.user.id;
        const isAdmin = (ctx.session.user as any).role === 'ADMIN';

        if (!isAdmin) {
          const securedSession = await prisma.academicSession.findFirst({
            where: {
              OR: [
                { studentId: userId, helperId: input.recipientId },
                { studentId: input.recipientId, helperId: userId },
              ],
              payment: { status: { in: ['HELD', 'RELEASED'] } }
            }
          });

          if (!securedSession) {
             throw new TRPCError({ 
               code: 'FORBIDDEN', 
               message: 'Messaging is only unlocked for secured current/past sessions.' 
             });
          }
        }

        return await prisma.message.create({
          data: {
            ...input,
            senderId: userId,
          },
        });
      }),

    markAsRead: protectedProcedure
      .input(z.object({ partnerId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        return await prisma.message.updateMany({
          where: {
            senderId: input.partnerId,
            recipientId: ctx.session.user.id,
            readAt: null,
          },
          data: {
            readAt: new Date(),
          },
        });
      }),
  }),

  // ── Reviews ───────────────────────────────────────────────────────────────
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

    initialize: protectedProcedure
      .input(z.object({
        sessionId: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const session = await prisma.academicSession.findUnique({
          where: { id: input.sessionId },
          include: { 
            student: true,
            helper: true,
            request: true
          }
        });

        if (!session) throw new TRPCError({ code: 'NOT_FOUND' });
        if (session.studentId !== ctx.session.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only the student can pay' });
        }

        const helperProfile = await prisma.helperProfile.findUnique({
          where: { userId: session.helperId }
        });

        if (!helperProfile || !helperProfile.hourlyRate) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Helper rate not set' });
        }

        const amountCents = Math.round(helperProfile.hourlyRate * 100);

        const paystackRes = await paystack.initializeTransaction(
          session.student.email,
          amountCents,
          { sessionId: session.id }
        );

        await prisma.payment.upsert({
          where: { sessionId: session.id },
          create: {
            sessionId: session.id,
            studentId: session.studentId,
            helperId: session.helperId,
            amountCents: amountCents,
            status: 'PENDING',
            provider: 'PAYSTACK',
            providerPaymentId: paystackRes.data.reference
          },
          update: {
            status: 'PENDING',
            providerPaymentId: paystackRes.data.reference
          }
        });

        return { checkoutUrl: paystackRes.data.authorization_url };
      }),

    verify: protectedProcedure
      .input(z.object({ reference: z.string() }))
      .mutation(async ({ input }) => {
        const verifyRes = await paystack.verifyTransaction(input.reference);
        if (verifyRes.data.status !== 'success') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Payment verification failed' });
        }

        const sessionId = verifyRes.data.metadata?.sessionId;
        if (!sessionId) throw new TRPCError({ code: 'BAD_REQUEST', message: 'No sessionId in metadata' });

        const session = await prisma.academicSession.findUnique({
          where: { id: sessionId },
          include: { payment: true }
        });

        if (!session) throw new TRPCError({ code: 'NOT_FOUND' });

        // Idempotency: skip if already processed
        if (session.payment?.status === 'HELD' || session.payment?.status === 'RELEASED') {
          return { success: true, alreadyProcessed: true };
        }

        // Generate meeting link
        const meetingLink = `https://meet.google.com/campus-${sessionId.slice(-8)}`;

        await prisma.$transaction([
          prisma.payment.update({
            where: { sessionId },
            data: { status: "HELD", providerPaymentId: input.reference },
          }),
          prisma.academicSession.update({
            where: { id: sessionId },
            data: { meetingLink },
          }),
          prisma.message.create({
            data: {
              senderId: session.helperId,
              recipientId: session.studentId,
              content: `📢 Session Secured! Here is our meeting link: ${meetingLink}`,
              sessionId: sessionId
            }
          }),
          prisma.notification.create({
            data: {
              userId: session.helperId,
              type: "SESSION_SECURED",
              title: "New Booking Paid",
              body: `Student has paid and secured the session. Meeting link: ${meetingLink}`,
            }
          }),
          // 🆕 Notification to Student
          prisma.notification.create({
            data: {
              userId: session.studentId,
              type: "PAYMENT_SUCCESS",
              title: "Payment Confirmed",
              body: `Your payment was successful and the session is now active. Meeting link: ${meetingLink}`,
            }
          })
        ]);

        return { success: true };
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
        const request = await prisma.verificationRequest.create({
          data: {
            ...input,
            userId: ctx.session.user.id,
            status: 'PENDING',
          },
        });

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
        if (input.status === 'APPROVED') {
          await prisma.user.update({
            where: { id: req.userId },
            data: { role: 'HELPER' },
          });

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
