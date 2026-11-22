import { Option } from 'effect';
import { describe, expect, it } from 'vitest';

import { describeGreeting, error, loading, ready } from './greeting.js';

describe('describeGreeting', () => {
  it('shows a loading message', () => {
    expect(describeGreeting(loading())).toBe('Loading greeting…');
  });

  it('shows the error message', () => {
    expect(describeGreeting(error({ message: 'network down' }))).toBe('Error: network down');
  });

  it('shows the greeting when present', () => {
    expect(describeGreeting(ready({ message: Option.some('Hello, Ada!') }))).toBe('Hello, Ada!');
  });

  it('falls back when the greeting is absent', () => {
    expect(describeGreeting(ready({ message: Option.none() }))).toBe('No greeting yet.');
  });
});
