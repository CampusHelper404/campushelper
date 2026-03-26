import {
  defaultShouldDehydrateQuery,
  QueryClient,
  QueryCache,
  MutationCache,
} from '@tanstack/react-query';
import superjson from 'superjson';
import { authClient } from '@/lib/auth-client';

const handleAuthError = (error: any) => {
  if (typeof window === 'undefined') return;
  
  if (error?.data?.code === 'FORBIDDEN' && error?.message?.includes('suspended')) {
    authClient.signOut().then(() => {
      window.location.href = '/auth/login';
    });
  }
};

export function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: handleAuthError,
    }),
    mutationCache: new MutationCache({
      onError: handleAuthError,
    }),
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
      },
      dehydrate: {
         serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
      },
      hydrate: {
         deserializeData: superjson.deserialize,
      },
    },
  });
}