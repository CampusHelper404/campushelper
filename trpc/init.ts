import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

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
  if ((ctx.session.user as any).isSuspended) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Account is suspended' });
  }
  return next({ ctx: { ...ctx, session: ctx.session } });
});

// Admin procedure - requires a session with ADMIN role
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const dbUser = await prisma.user.findUnique({ where: { id: ctx.session.user.id } });
  if (dbUser?.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

// Helper procedure - requires a session with HELPER or ADMIN role
export const helperProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const dbUser = await prisma.user.findUnique({ where: { id: ctx.session.user.id } });
  if (dbUser?.role !== 'HELPER' && dbUser?.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Helper access required' });
  }
  return next({ ctx });
});
