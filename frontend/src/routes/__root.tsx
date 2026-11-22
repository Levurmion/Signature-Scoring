import { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import { HealthIndicator } from '@/components/molecules/health-indicator';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthProvider } from '@/lib/supabase/useAuth';

export interface RouterContext {
  readonly queryClient: QueryClient;
}

const RootComponent = () => (
  <AuthProvider>
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>Signature Scoring</CardTitle>
            <HealthIndicator />
          </div>
          <CardDescription>Dr C. Hess</CardDescription>
        </CardHeader>
      </Card>
      <Outlet />
    </main>
    <TanStackRouterDevtools position="bottom-right" />
  </AuthProvider>
);

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});
