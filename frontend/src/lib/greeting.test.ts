import { Option } from 'effect';
import { describe, expect, it } from 'vitest';

import { describeGreeting } from './greeting.js';

describe('describeGreeting', () => {
  it('shows a loading message', () => {
    expect(describeGreeting({ _tag: 'loading' })).toBe('Loading greeting…');
  });

  it('shows the error message', () => {
    expect(describeGreeting({ _tag: 'error', message: 'network down' })).toBe(
      'Error: network down',
    );
  });

  it('shows the greeting when present', () => {
    expect(describeGreeting({ _tag: 'ready', message: Option.some('Hello, Ada!') })).toBe(
      'Hello, Ada!',
    );
  });

  it('falls back when the greeting is absent', () => {
    expect(describeGreeting({ _tag: 'ready', message: Option.none() })).toBe('No greeting yet.');
  });
});
