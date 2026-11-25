import { type ErrorComponentProps, Link, useRouter } from '@tanstack/react-router';
import { Option } from 'effect';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { errorDetail } from './error';

export const ErrorPage = ({
  error,
  showDetail = import.meta.env.DEV,
}: Pick<ErrorComponentProps, 'error'> & { readonly showDetail?: boolean }) => {
  const router = useRouter();
  const detail = Option.getOrNull(showDetail ? errorDetail(error) : Option.none());

  return (
    <Card role="alert" data-slot="error-page">
      <CardHeader>
        <CardTitle>Something went wrong</CardTitle>
        <CardDescription>
          An unexpected error stopped this page from loading. Try again, or go back to the start.
        </CardDescription>
      </CardHeader>
      {detail && (
        <CardContent>
          <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs whitespace-pre-wrap text-muted-foreground">
            {detail}
          </pre>
        </CardContent>
      )}
      <CardFooter className="gap-2">
        <Button onClick={() => void router.invalidate()}>Try again</Button>
        <Button variant="outline" asChild>
          <Link to="/">Go to start</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export const RootErrorPage = ({ error }: Pick<ErrorComponentProps, 'error'>) => (
  <main className="mx-auto flex min-h-svh w-full max-w-xl flex-col items-center justify-center p-6">
    <ErrorPage error={error} />
  </main>
);
