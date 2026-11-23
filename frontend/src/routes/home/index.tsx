import { createFileRoute, redirect } from '@tanstack/react-router';
import { Option } from 'effect';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';

export const Route = createFileRoute('/home/')({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();

    Option.match(Option.fromNullOr(data.session), {
      onNone: () => redirect({ to: '/' }),
      onSome: () => undefined,
    });
  },
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
