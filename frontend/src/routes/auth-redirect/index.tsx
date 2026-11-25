import { createFileRoute } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { $api } from '@/lib/api/client';

export const Route = createFileRoute('/auth-redirect/')({
  component: RouteComponent,
});

const REDIRECT_DELAY = 1000;

function RouteComponent() {
  const navigate = useNavigate();
  const { data, error } = $api.useQuery('get', '/api/users/redirect', undefined, {
    throwOnError: (err) => err._tag === 'DbError',
  });

  useEffect(() => {
    if (data) {
      setTimeout(() => {
        void navigate({ to: '/home' });
      }, REDIRECT_DELAY);
      return;
    }
    if (error) {
      switch (error._tag) {
        case 'DbError':
        case 'UnauthorizedError': {
          setTimeout(() => {
            void navigate({ to: '/' });
          }, REDIRECT_DELAY);
          break;
        }
        case 'NotFoundError': {
          setTimeout(() => {
            void navigate({ to: '/sign-up' });
          }, REDIRECT_DELAY);
          break;
        }
      }
    }
  }, [data, error, navigate]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>You are signed in!</CardTitle>
      </CardHeader>
      <CardContent className="grid place-items-center">
        <div className="flex items-center justify-center gap-2">
          <Spinner />
          <p>Redirecting...</p>
        </div>
      </CardContent>
    </Card>
  );
}
