import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';

export interface TRPCContext {
  token: string | null;
}

export async function createTRPCContext(opts?: { req?: Request }): Promise<TRPCContext> {
  // Read JWT from Authorization header (sent by the tRPC client)
  const authorization = opts?.req?.headers.get('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
  return { token };
}

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

// Public procedure - no auth required
export const baseProcedure = t.procedure;

// Protected procedure - requires a valid JWT token in context
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.token) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
  }
  return next({ ctx: { ...ctx, token: ctx.token } });
});
