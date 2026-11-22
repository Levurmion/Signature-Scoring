import { createFileRoute } from '@tanstack/react-router';
import { Option } from 'effect';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { $api } from '@/lib/api/client';
import { describeGreeting } from '@/lib/greeting';

export const IndexPage = () => {
  const hello = $api.useQuery('get', '/api/hello');

  const greeting = hello.isPending
    ? describeGreeting({ _tag: 'loading' })
    : hello.isError
      ? describeGreeting({ _tag: 'error', message: hello.error.message })
      : describeGreeting({ _tag: 'ready', message: Option.fromUndefinedOr(hello.data?.message) });

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
        </CardContent>
      </Card>
    </main>
  );
};

export const Route = createFileRoute('/')({
  component: IndexPage,
});
