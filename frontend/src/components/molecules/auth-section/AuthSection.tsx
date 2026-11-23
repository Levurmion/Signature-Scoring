import { Button } from '@/components/ui/button';
import { $match, signInWithGoogle, signOut, useAuth } from '@/lib/supabase/useAuth';

export const AuthSection = () => {
  const state = useAuth();

  return $match(state, {
    Checking: () => <p className="text-sm text-muted-foreground">Checking session...</p>,
    SignedIn: ({ session }) => (
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex flex-col overflow-hidden text-sm">
          <p className="font-medium">Signed in as</p>
          <p className="truncate">{session.user.email}</p>
        </div>
        <Button className="shrink-0" variant="outline" onClick={() => void signOut()}>
          Sign out
        </Button>
      </div>
    ),
    SignedOut: () => (
      <Button variant="outline" onClick={() => void signInWithGoogle()}>
        Sign in with Google
      </Button>
    ),
  });
};
