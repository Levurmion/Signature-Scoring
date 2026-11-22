import { Data } from 'effect';

export type HealthState = Data.TaggedEnum<{
  readonly Fetching: {};
  readonly Ok: {};
  readonly Error: {};
}>;

export const { Fetching, Ok, Error, $match } = Data.taggedEnum<HealthState>();

export const healthState = (query: {
  readonly isFetching: boolean;
  readonly isError: boolean;
}): HealthState => (query.isFetching ? Fetching() : query.isError ? Error() : Ok());

export const describeHealthState = $match({
  Fetching: () => 'Checking API health…',
  Ok: () => 'API is healthy',
  Error: () => 'API is unreachable',
});
