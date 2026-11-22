import { Data } from 'effect';

export type HealthState = Data.TaggedEnum<{
  readonly fetching: {};
  readonly ok: {};
  readonly error: {};
}>;

export const { fetching, ok, error, $match } = Data.taggedEnum<HealthState>();

export const healthState = (query: {
  readonly isFetching: boolean;
  readonly isError: boolean;
}): HealthState => (query.isFetching ? fetching() : query.isError ? error() : ok());

export const describeHealthState = $match({
  fetching: () => 'Checking API health…',
  ok: () => 'API is healthy',
  error: () => 'API is unreachable',
});
