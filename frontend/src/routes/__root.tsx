import { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet, redirect } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { Option, pipe } from 'effect';

import { AuthSection } from '@/components/molecules/auth-section/AuthSection';
import { HealthIndicator } from '@/components/molecules/health-indicator';
import { RootErrorPage } from '@/components/pages/error-page';
import { Card, CardDescription, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import { AuthProvider } from '@/lib/supabase/useAuth';

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
          <CardDescription>Dr C. Hess</CardDescription>
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
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    pipe(
      data.session,
      Option.fromNullOr,
      Option.match({
        onSome: () => void redirect({ to: '/home' }),
        onNone: () => undefined,
      }),
    );
  },
});
