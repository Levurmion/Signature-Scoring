import { Data, Option } from 'effect';

export type GreetingState = Data.TaggedEnum<{
  readonly loading: {};
  readonly error: { readonly message: string };
  readonly ready: { readonly message: Option.Option<string> };
}>;

export const { loading, error, ready, $match } = Data.taggedEnum<GreetingState>();

/**
 * Pure presentation logic, kept out of the component so it is trivially unit testable. This is an
 * example of ordinary domain code using `effect`'s `Option`/`Match` rather than ad-hoc
 * `if`/ternary chains, per the functional-effect rule.
 */
export const describeGreeting = $match({
  loading: () => 'Loading greeting...',
  error: ({ message }) => `Error: ${message}`,
  ready: ({ message }) => Option.getOrElse(message, () => 'No greeting yet.'),
});
