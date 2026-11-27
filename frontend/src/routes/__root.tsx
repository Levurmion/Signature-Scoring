import { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import { AuthSection } from '@/components/molecules/auth-section/AuthSection';
import { HealthIndicator } from '@/components/molecules/health-indicator';
import { RootErrorPage } from '@/components/pages/error-page';
import { Card, CardDescription, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { AuthProvider } from '@/lib/auth';

export interface RouterContext {
  readonly queryClient: QueryClient;
}

const RootComponent = () => (
  <AuthProvider>
    <main className="m-6 mx-auto flex min-h-svh w-full max-w-xl flex-col items-center justify-center gap-2 p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>Signature Scoring</CardTitle>
            <HealthIndicator />
          </div>
          <CardDescription>Dr Christoph Hess</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthSection />
        </CardContent>
      </Card>
      <Outlet />
    </main>
    <TanStackRouterDevtools position="bottom-right" />
  </AuthProvider>
);

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  errorComponent: RootErrorPage,
});
