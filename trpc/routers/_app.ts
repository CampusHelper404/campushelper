import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { baseProcedure, createTRPCRouter, protectedProcedure } from '../init';
import {
  createApi,
  setToken,
  removeToken,
  type UserRole,
  type HelpRequestStatus,
  type SessionStatus,
  type PaymentStatus,
} from '@/lib/api';

function err(e: unknown) {
  return (e as Error).message;
}

export const appRouter = createTRPCRouter({
  // ── Auth ───────────────────────────────────────────────────────────────────
  auth: createTRPCRouter({
    register: baseProcedure
      .input(z.object({
        full_name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(8),
        role: z.enum(['student', 'helper', 'both', 'admin']),
        bio: z.string().optional(),
        avatar_url: z.string().url().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const result = await createApi().auth.register(input);
          if (typeof window !== 'undefined') setToken(result.token);
          return result;
        } catch (e) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: err(e) });
        }
      }),

    login: baseProcedure
      .input(z.object({ email: z.string().email(), password: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const result = await createApi().auth.login(input.email, input.password);
          if (typeof window !== 'undefined') setToken(result.token);
          return result;
        } catch (e) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: err(e) });
        }
      }),

    me: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          return await createApi(ctx.token).auth.me();
        } catch (e) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: err(e) });
        }
      }),

    logout: baseProcedure
      .mutation(() => {
        if (typeof window !== 'undefined') removeToken();
        return { success: true };
      }),
  }),

  // ── Users ──────────────────────────────────────────────────────────────────
  users: createTRPCRouter({
    me: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          return await createApi(ctx.token).users.me();
        } catch (e) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: err(e) });
        }
      }),

    updateMe: protectedProcedure
      .input(z.object({
        full_name: z.string().optional(),
        bio: z.string().optional(),
        avatar_url: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          return await createApi(ctx.token).users.updateMe(input);
        } catch (e) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: err(e) });
        }
      }),

    getById: baseProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        try {
          return await createApi().users.getById(input.id);
        } catch (e) {
          throw new TRPCError({ code: 'NOT_FOUND', message: err(e) });
        }
      }),

    list: baseProcedure
      .input(z.object({ role: z.enum(['student', 'helper', 'both', 'admin']).optional() }).optional())
      .query(async ({ input }) => {
        try {
          return await createApi().users.list(input?.role as UserRole);
        } catch (e) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: err(e) });
        }
      }),
  }),

  // ── Courses ────────────────────────────────────────────────────────────────
  courses: createTRPCRouter({
    list: baseProcedure
      .query(async () => {
        try {
          return await createApi().courses.list();
        } catch (e) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: err(e) });
        }
      }),

    create: protectedProcedure
      .input(z.object({ code: z.string(), name: z.string(), description: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        try {
          return await createApi(ctx.token).courses.create(input);
        } catch (e) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: err(e) });
        }
      }),
  }),

  // ── Help Requests ──────────────────────────────────────────────────────────
  helpRequests: createTRPCRouter({
    list: baseProcedure
      .input(z.object({
        status: z.enum(['pending', 'accepted', 'declined', 'cancelled', 'completed']).optional(),
        student_id: z.number().optional(),
        course_id: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        try {
          return await createApi().helpRequests.list(input as { status?: HelpRequestStatus; student_id?: number; course_id?: number });
        } catch (e) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: err(e) });
        }
      }),

    getById: baseProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        try {
          return await createApi().helpRequests.getById(input.id);
        } catch (e) {
          throw new TRPCError({ code: 'NOT_FOUND', message: err(e) });
        }
      }),

    create: protectedProcedure
      .input(z.object({
        course_id: z.number().optional(),
        title: z.string().min(1),
        description: z.string().optional(),
        preferred_date: z.string().optional(),
        preferred_time: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          return await createApi(ctx.token).helpRequests.create(input);
        } catch (e) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: err(e) });
        }
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['pending', 'accepted', 'declined', 'cancelled', 'completed']),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          return await createApi(ctx.token).helpRequests.updateStatus(input.id, input.status as HelpRequestStatus);
        } catch (e) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: err(e) });
        }
      }),
  }),

  // ── Sessions ───────────────────────────────────────────────────────────────
  sessions: createTRPCRouter({
    list: baseProcedure
      .input(z.object({
        helper_id: z.number().optional(),
        student_id: z.number().optional(),
        status: z.enum(['upcoming', 'in_progress', 'completed', 'cancelled', 'no_show']).optional(),
      }).optional())
      .query(async ({ input }) => {
        try {
          return await createApi().sessions.list(input as { helper_id?: number; student_id?: number; status?: SessionStatus });
        } catch (e) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: err(e) });
        }
      }),

    getById: baseProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        try {
          return await createApi().sessions.getById(input.id);
        } catch (e) {
          throw new TRPCError({ code: 'NOT_FOUND', message: err(e) });
        }
      }),

    create: protectedProcedure
      .input(z.object({
        help_request_id: z.number(),
        student_id: z.number(),
        helper_id: z.number(),
        start_time: z.string(),
        end_time: z.string().optional(),
        meeting_link: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          return await createApi(ctx.token).sessions.create(input);
        } catch (e) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: err(e) });
        }
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['upcoming', 'in_progress', 'completed', 'cancelled', 'no_show']),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          return await createApi(ctx.token).sessions.updateStatus(input.id, input.status as SessionStatus);
        } catch (e) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: err(e) });
        }
      }),
  }),

  // ── Helpers ────────────────────────────────────────────────────────────────
  helpers: createTRPCRouter({
    list: baseProcedure
      .input(z.object({ course_id: z.number().optional() }).optional())
      .query(async ({ input }) => {
        try {
          return await createApi().helpers.list(input?.course_id);
        } catch (e) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: err(e) });
        }
      }),

    setCourses: protectedProcedure
      .input(z.object({ helperId: z.number(), course_ids: z.array(z.number()) }))
      .mutation(async ({ input, ctx }) => {
        try {
          return await createApi(ctx.token).helpers.setCourses(input.helperId, input.course_ids);
        } catch (e) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: err(e) });
        }
      }),
  }),

  // ── Availability ───────────────────────────────────────────────────────────
  availability: createTRPCRouter({
    list: baseProcedure
      .input(z.object({ helper_id: z.number() }))
      .query(async ({ input }) => {
        try {
          return await createApi().availability.list(input.helper_id);
        } catch (e) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: err(e) });
        }
      }),

    create: protectedProcedure
      .input(z.object({
        weekday: z.number().min(0).max(6).optional(),
        start_time: z.string(),
        end_time: z.string(),
        specific_date: z.string().optional(),
        is_recurring: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          return await createApi(ctx.token).availability.create(input);
        } catch (e) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: err(e) });
        }
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        try {
          await createApi(ctx.token).availability.delete(input.id);
          return { success: true };
        } catch (e) {
          throw new TRPCError({ code: 'NOT_FOUND', message: err(e) });
        }
      }),
  }),

  // ── Messages ───────────────────────────────────────────────────────────────
  messages: createTRPCRouter({
    list: protectedProcedure
      .input(z.object({
        help_request_id: z.number().optional(),
        session_id: z.number().optional(),
      }))
      .query(async ({ input, ctx }) => {
        try {
          return await createApi(ctx.token).messages.list(input);
        } catch (e) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: err(e) });
        }
      }),

    send: protectedProcedure
      .input(z.object({
        help_request_id: z.number().optional(),
        session_id: z.number().optional(),
        recipient_id: z.number(),
        content: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          return await createApi(ctx.token).messages.send(input);
        } catch (e) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: err(e) });
        }
      }),
  }),

  // ── Reviews ────────────────────────────────────────────────────────────────
  reviews: createTRPCRouter({
    list: protectedProcedure
      .input(z.object({ user_id: z.number(), as: z.enum(['helper', 'student']).optional() }))
      .query(async ({ input, ctx }) => {
        try {
          return await createApi(ctx.token).reviews.list(input.user_id, input.as);
        } catch (e) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: err(e) });
        }
      }),

    create: protectedProcedure
      .input(z.object({
        session_id: z.number(),
        reviewer_id: z.number(),
        reviewee_id: z.number(),
        reviewer_role: z.enum(['student', 'helper']),
        rating: z.number().min(1).max(5).optional(),
        comment: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          return await createApi(ctx.token).reviews.create(input);
        } catch (e) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: err(e) });
        }
      }),
  }),

  // ── Notifications ──────────────────────────────────────────────────────────
  notifications: createTRPCRouter({
    list: protectedProcedure
      .input(z.object({ unread_only: z.boolean().optional() }))
      .query(async ({ input, ctx }) => {
        try {
          return await createApi(ctx.token).notifications.list(input.unread_only);
        } catch (e) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: err(e) });
        }
      }),

    markRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        try {
          return await createApi(ctx.token).notifications.markRead(input.id);
        } catch (e) {
          throw new TRPCError({ code: 'NOT_FOUND', message: err(e) });
        }
      }),
  }),

  // ── Payments ───────────────────────────────────────────────────────────────
  payments: createTRPCRouter({
    list: protectedProcedure
      .input(z.object({
        student_id: z.number().optional(),
        helper_id: z.number().optional(),
        status: z.enum(['pending', 'authorized', 'captured', 'refunded', 'failed', 'cancelled']).optional(),
      }).optional())
      .query(async ({ input, ctx }) => {
        try {
          return await createApi(ctx.token).payments.list(input as { student_id?: number; helper_id?: number; status?: PaymentStatus });
        } catch (e) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: err(e) });
        }
      }),

    create: protectedProcedure
      .input(z.object({
        session_id: z.number(),
        student_id: z.number(),
        helper_id: z.number(),
        amount_cents: z.number().positive(),
        currency: z.string().length(3).optional(),
        status: z.enum(['pending', 'authorized', 'captured', 'refunded', 'failed', 'cancelled']).optional(),
        provider: z.string().optional(),
        provider_payment_id: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          return await createApi(ctx.token).payments.create(input);
        } catch (e) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: err(e) });
        }
      }),
  }),

  // ── Verification ───────────────────────────────────────────────────────────
  verification: createTRPCRouter({
    submit: protectedProcedure
      .mutation(async ({ ctx }) => {
        try {
          return await createApi(ctx.token).verification.submit();
        } catch (e) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: err(e) });
        }
      }),

    list: protectedProcedure
      .input(z.object({ status: z.enum(['pending', 'approved', 'rejected']).optional() }))
      .query(async ({ input, ctx }) => {
        try {
          return await createApi(ctx.token).verification.list(input.status);
        } catch (e) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: err(e) });
        }
      }),

    review: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['approved', 'rejected']),
        rejection_reason: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          return await createApi(ctx.token).verification.review(input.id, { status: input.status, rejection_reason: input.rejection_reason });
        } catch (e) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: err(e) });
        }
      }),
  }),

  // ── Analytics ──────────────────────────────────────────────────────────────
  analytics: createTRPCRouter({
    track: protectedProcedure
      .input(z.object({
        event_type: z.string(),
        session_id: z.number().optional(),
        help_request_id: z.number().optional(),
        metadata: z.record(z.string(), z.unknown()).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          return await createApi(ctx.token).analytics.track(input.event_type, input);
        } catch (e) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: err(e) });
        }
      }),

    summary: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          return await createApi(ctx.token).analytics.summary();
        } catch (e) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: err(e) });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
