import { describe, expect, it } from 'vitest';

import { describeHealthState, Error, Fetching, healthState, Ok } from './health';

describe('healthState', () => {
  it('is fetching while the query is in flight', () => {
    expect(healthState({ isFetching: true, isError: false })).toEqual(Fetching());
  });

  it('prefers fetching over a stale error while refetching', () => {
    expect(healthState({ isFetching: true, isError: true })).toEqual(Fetching());
  });

  it('is an error once a failed query settles', () => {
    expect(healthState({ isFetching: false, isError: true })).toEqual(Error());
  });

  it('is ok once a successful query settles', () => {
    expect(healthState({ isFetching: false, isError: false })).toEqual(Ok());
  });
});

describe('describeHealthState', () => {
  it('describes the fetching state', () => {
    expect(describeHealthState(Fetching())).toBe('Checking API health…');
  });

  it('describes the error state', () => {
    expect(describeHealthState(Error())).toBe('API is unreachable');
  });

  it('describes the ok state', () => {
    expect(describeHealthState(Ok())).toBe('API is healthy');
  });
});
