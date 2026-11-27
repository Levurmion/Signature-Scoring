import { useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { assertNever } from '@/lib/assert';
import { signInWithGoogle, signOut, useAuth } from '@/lib/auth';

export const AuthSection = () => {
  const state = useAuth();
  const queryClient = useQueryClient();

  switch (state.kind) {
    case 'Checking':
      return <p className="text-sm text-muted-foreground">Checking session...</p>;
    case 'SignedIn':
      return (
        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex flex-col overflow-hidden text-sm">
            <p className="font-medium">Signed in as</p>
            <p className="truncate">{state.email}</p>
          </div>
          <Button className="shrink-0" variant="outline" onClick={() => void signOut(queryClient)}>
            Sign out
          </Button>
        </div>
      );
    case 'SignedOut':
      return (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={signInWithGoogle}>
            Sign in with Google
          </Button>
          <Button variant="outline" asChild>
            <Link to="/sign-up" search={{ provider: 'email' }}>
              Sign up with email
            </Link>
          </Button>
        </div>
      );
    default:
      return assertNever(state);
  }
};
