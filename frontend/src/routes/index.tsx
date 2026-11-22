import { createFileRoute } from '@tanstack/react-router';
import { Option } from 'effect';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { $api } from '@/lib/api/client';
import { describeGreeting, error, loading, ready } from '@/lib/greeting';
import { signInWithGoogle, signOut, useAuth } from '@/lib/supabase/useAuth';

export const IndexPage = () => {
  const hello = $api.useQuery('get', '/api/hello');
  const { session, loading: authLoading } = useAuth();

  const greeting = hello.isPending
    ? describeGreeting(loading())
    : hello.isError
      ? describeGreeting(error({ message: hello.error.message }))
      : describeGreeting(ready({ message: Option.fromUndefinedOr(hello.data?.message) }));

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Signature Scoring</CardTitle>
          <CardDescription>React 19 + Vite, talking to the Effect HttpApi backend.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm">{greeting}</p>
          <Button onClick={() => void hello.refetch()} disabled={hello.isFetching}>
            Refetch
          </Button>
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
