import { describe, expect, it } from 'vitest';

import { errorDetail } from './error';

describe('errorDetail', () => {
  it('uses the message of an Error', () => {
    expect(errorDetail(new Error('boom'))).toBe('boom');
  });

  it('trims surrounding whitespace', () => {
    expect(errorDetail(new Error('  boom \n'))).toBe('boom');
  });

  it('is null for an Error with an empty message', () => {
    expect(errorDetail(new Error('   '))).toBeNull();
  });

  it('is null for a thrown non-Error value', () => {
    expect(errorDetail('boom')).toBeNull();
    expect(errorDetail(undefined)).toBeNull();
  });
});
