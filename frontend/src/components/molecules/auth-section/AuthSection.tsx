import { useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { $match, signInWithGoogle, signOut, useAuth } from '@/lib/auth';

export const AuthSection = () => {
  const state = useAuth();
  const queryClient = useQueryClient();

  return $match(state, {
    Checking: () => <p className="text-sm text-muted-foreground">Checking session...</p>,
    SignedIn: ({ email }) => (
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex flex-col overflow-hidden text-sm">
          <p className="font-medium">Signed in as</p>
          <p className="truncate">{email}</p>
        </div>
        <Button className="shrink-0" variant="outline" onClick={() => void signOut(queryClient)}>
          Sign out
        </Button>
      </div>
    ),
    SignedOut: () => (
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
    ),
  });
};
