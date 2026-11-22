import { describe, expect, it } from 'vitest';

import { describeHealthState, error, fetching, healthState, ok } from './health.js';

describe('healthState', () => {
  it('is fetching while the query is in flight', () => {
    expect(healthState({ isFetching: true, isError: false })).toEqual(fetching());
  });

  it('prefers fetching over a stale error while refetching', () => {
    expect(healthState({ isFetching: true, isError: true })).toEqual(fetching());
  });

  it('is an error once a failed query settles', () => {
    expect(healthState({ isFetching: false, isError: true })).toEqual(error());
  });

  it('is ok once a successful query settles', () => {
    expect(healthState({ isFetching: false, isError: false })).toEqual(ok());
  });
});

describe('describeHealthState', () => {
  it('describes the fetching state', () => {
    expect(describeHealthState(fetching())).toBe('Checking API health…');
  });

  it('describes the error state', () => {
    expect(describeHealthState(error())).toBe('API is unreachable');
  });

  it('describes the ok state', () => {
    expect(describeHealthState(ok())).toBe('API is healthy');
  });
});
