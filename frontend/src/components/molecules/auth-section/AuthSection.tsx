import { Button } from '@/components/ui/button';
import { $match, signInWithGoogle, useAuth } from '@/lib/supabase/useAuth';

export const AuthSection = () => {
  const state = useAuth();

  return $match(state, {
    Checking: () => <p className="text-sm text-muted-foreground">Checking session...</p>,
    SignedIn: ({ session }) => (
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm">Signed in as {session.user.email}</p>
      </div>
    ),
    SignedOut: () => (
      <Button variant="outline" onClick={() => void signInWithGoogle()}>
        Sign in with Google
      </Button>
    ),
  });
};
