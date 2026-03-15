import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export interface TRPCContext {
  session: typeof auth.$Infer.Session | null;
}

export async function createTRPCContext(): Promise<TRPCContext> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return { session };
}

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

// Public procedure - no auth required
export const baseProcedure = t.procedure;

// Protected procedure - requires a valid session
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
  }
  return next({ ctx: { ...ctx, session: ctx.session } });
});

// Admin procedure - requires a session with ADMIN role
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  const user = ctx.session.user as any;
  if (user.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

// Consultant procedure - requires a session with CONSULTANT or ADMIN role
export const consultantProcedure = protectedProcedure.use(({ ctx, next }) => {
  const user = ctx.session.user as any;
  if (user.role !== 'CONSULTANT' && user.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Consultant access required' });
  }
  return next({ ctx });
});
