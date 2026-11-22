import { Match, Option } from 'effect';

export type GreetingState =
  | { readonly _tag: 'loading' }
  | { readonly _tag: 'error'; readonly message: string }
  | { readonly _tag: 'ready'; readonly message: Option.Option<string> };

/**
 * Pure presentation logic, kept out of the component so it is trivially unit testable. This is an
 * example of ordinary domain code using `effect`'s `Option`/`Match` rather than ad-hoc
 * `if`/ternary chains, per the functional-effect rule.
 */
export const describeGreeting = (state: GreetingState): string =>
  Match.value(state).pipe(
    Match.tag('loading', () => 'Loading greeting…'),
    Match.tag('error', ({ message }) => `Error: ${message}`),
    Match.tag('ready', ({ message }) => Option.getOrElse(message, () => 'No greeting yet.')),
    Match.exhaustive,
  );
