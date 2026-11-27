import type { QueryClient } from '@tanstack/react-query';

import { $api, fetchClient } from '@/lib/api/client';

/**
 * --agent
 * The session lives in HttpOnly cookies the API sets, so the browser can't read it directly; the
 * only way to know who is signed in is to ask the API. Every fetch sends those cookies because the
 * API is always same-origin (`/api/...`).
 */
export const sessionQueryOptions = $api.queryOptions('get', '/api/auth/session', undefined, {
  retry: false,
});

export const invalidateSession = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: sessionQueryOptions.queryKey });

/** Full-page navigation: the API redirects to Google and back to `/auth-redirect`. */
export const signInWithGoogle = () => window.location.assign('/api/auth/google');

export const signOut = (queryClient: QueryClient) =>
  fetchClient.POST('/api/auth/sign-out').then(() => invalidateSession(queryClient));
