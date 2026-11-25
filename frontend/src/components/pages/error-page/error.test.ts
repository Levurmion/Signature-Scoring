import { Option } from 'effect';
import { describe, expect, it } from 'vitest';

import { errorDetail } from './error.js';

describe('errorDetail', () => {
  it('uses the message of an Error', () => {
    expect(errorDetail(new Error('boom'))).toEqual(Option.some('boom'));
  });

  it('trims surrounding whitespace', () => {
    expect(errorDetail(new Error('  boom \n'))).toEqual(Option.some('boom'));
  });

  it('is none for an Error with an empty message', () => {
    expect(errorDetail(new Error('   '))).toEqual(Option.none());
  });

  it('is none for a thrown non-Error value', () => {
    expect(errorDetail('boom')).toEqual(Option.none());
    expect(errorDetail(undefined)).toEqual(Option.none());
  });
});
