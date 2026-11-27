import { assertNever } from '@/lib/assert';

export type HealthState = 'Fetching' | 'Ok' | 'Error';

export const healthState = (query: {
  readonly isFetching: boolean;
  readonly isError: boolean;
}): HealthState => (query.isFetching ? 'Fetching' : query.isError ? 'Error' : 'Ok');

export const describeHealthState = (state: HealthState): string => {
  switch (state) {
    case 'Fetching':
      return 'Checking API health…';
    case 'Ok':
      return 'API is healthy';
    case 'Error':
      return 'API is unreachable';
    default:
      return assertNever(state);
  }
};
