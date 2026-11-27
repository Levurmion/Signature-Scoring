import { createFileRoute, redirect } from '@tanstack/react-router';

import { Card, CardContent } from '@/components/ui/card';
import { fetchClient } from '@/lib/api/client';
import { assertNever } from '@/lib/assert';

export const Route = createFileRoute('/home/')({
  beforeLoad: async (): Promise<void> => {
    const result = await fetchClient
      .GET('/api/users/redirect', { cache: 'reload' })
      .catch(() => Promise.reject(redirect({ to: '/' })));

    if (!result.error) return;
    switch (result.error._tag) {
      case 'DbError':
      case 'UnauthorizedError':
        return Promise.reject(redirect({ to: '/' }));
      case 'NotFoundError':
        return Promise.reject(redirect({ to: '/sign-up', search: { provider: 'google' } }));
      default:
        return assertNever(result.error);
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Card>
      <CardContent>
        <p>Start</p>
      </CardContent>
    </Card>
  );
}
