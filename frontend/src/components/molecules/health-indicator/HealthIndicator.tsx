import { Spinner } from '@/components/ui/spinner';
import { $api } from '@/lib/api/client';
import { assertNever } from '@/lib/assert';
import { cn } from '@/lib/utils';

import { describeHealthState, healthState } from './health';

const Dot = ({ className, label }: { readonly className: string; readonly label: string }) => (
  <output data-slot="health-indicator" className="inline-flex" title={label}>
    <span aria-hidden="true" className={cn('inline-block size-2.5 rounded-full', className)} />
    <span className="sr-only">{label}</span>
  </output>
);

export const HealthIndicator = () => {
  const health = $api.useQuery('get', '/api/health', { pollingInterval: 10000 });
  const state = healthState({ isFetching: health.isFetching, isError: health.isError });
  const label = describeHealthState(state);

  switch (state) {
    case 'Fetching':
      return <Spinner data-slot="health-indicator" size="sm" title={label} />;
    case 'Ok':
      return <Dot className="animate-pulse bg-green-500" label={label} />;
    case 'Error':
      return <Dot className="bg-destructive" label={label} />;
    default:
      return assertNever(state);
  }
};
