import type { Session } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';

import { authState, SignedIn, SignedOut } from './useAuth.js';

const session = { user: { email: 'dr.hess@example.com' } } as Session;

describe('authState', () => {
  it('is signedOut when there is no session', () => {
    expect(authState(null)).toEqual(SignedOut());
  });

  it('is signedIn when there is a session', () => {
    expect(authState(session)).toEqual(SignedIn({ session }));
  });
});
