import { createFileRoute } from '@tanstack/react-router';

import { HealthIndicator } from '@/components/molecules/health-indicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { $api } from '@/lib/api/client';
import { signInWithGoogle, signOut, useAuth } from '@/lib/supabase/useAuth';

export const IndexPage = () => {
  const health = $api.useQuery('get', '/api/health', { pollingInterval: 10000 });
  const { session, loading: authLoading } = useAuth();

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>Signature Scoring</CardTitle>
            <HealthIndicator isFetching={health.isFetching} isError={health.isError} />
          </div>
          <CardDescription>Dr C. Hess</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {authLoading ? (
            <p className="text-sm text-muted-foreground">Checking session...</p>
          ) : session ? (
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm">Signed in as {session.user.email}</p>
              <Button variant="outline" onClick={() => void signOut()}>
                Sign out
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => void signInWithGoogle()}>
              Sign in with Google
            </Button>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export const Route = createFileRoute('/')({
  component: IndexPage,
});
