import { createFileRoute, redirect } from '@tanstack/react-router';
import { Option } from 'effect';

import { supabase } from '@/lib/supabase/client';

export const Route = createFileRoute('/home/')({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();

    return Option.match(Option.fromNullOr(data.session), {
      onNone: () => redirect({ to: '/' }),
      onSome: () => undefined,
    });
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <></>;
}
