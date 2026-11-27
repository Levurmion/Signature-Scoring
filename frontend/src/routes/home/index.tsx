import { createFileRoute, redirect } from '@tanstack/react-router';
import { Effect } from 'effect';

import { Card, CardContent } from '@/components/ui/card';
import { fetchClient } from '@/lib/api/client';

export const Route = createFileRoute('/home/')({
  beforeLoad: () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const result = yield* Effect.tryPromise({
          try: () => fetchClient.GET('/api/users/redirect', { cache: 'reload' }),
          catch: () => Effect.fail(redirect({ to: '/' })),
        });

        if (result.error) {
          switch (result.error._tag) {
            case 'DbError':
            case 'UnauthorizedError': {
              yield* Effect.fail(redirect({ to: '/' }));
              break;
            }
            case 'NotFoundError':
              yield* Effect.fail(redirect({ to: '/sign-up', search: { provider: 'google' } }));
              break;
          }
        }
      }),
    ),
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
