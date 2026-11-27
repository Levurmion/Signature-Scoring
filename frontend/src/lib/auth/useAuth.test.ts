import { describe, expect, it } from 'vitest';

import { authState } from './useAuth';

const email = 'dr.hess@example.com';

describe('authState', () => {
  it('is checking while the session request is in flight', () => {
    expect(authState({ isPending: true, isError: false, data: undefined })).toEqual({
      kind: 'Checking',
    });
  });

  it('is signedOut when the API reports no session', () => {
    expect(authState({ isPending: false, isError: true, data: undefined })).toEqual({
      kind: 'SignedOut',
    });
  });

  it('is signedIn with the email the API reports', () => {
    expect(authState({ isPending: false, isError: false, data: { email } })).toEqual({
      kind: 'SignedIn',
      email,
    });
  });

  it('is signedOut once a refetch fails, even though the last session data is kept', () => {
    expect(authState({ isPending: false, isError: true, data: { email } })).toEqual({
      kind: 'SignedOut',
    });
  });
});
