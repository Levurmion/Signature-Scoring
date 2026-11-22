import { createFileRoute } from '@tanstack/react-router';

import { AuthButton } from '@/components/molecules/auth-button';
import { HealthIndicator } from '@/components/molecules/health-indicator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const IndexPage = () => {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>Signature Scoring</CardTitle>
            <HealthIndicator />
          </div>
          <CardDescription>Dr C. Hess</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <AuthButton />
        </CardContent>
      </Card>
    </main>
  );
};

export const Route = createFileRoute('/')({
  component: IndexPage,
});
