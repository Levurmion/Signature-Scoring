import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

import { $match, describeHealthState, healthState } from './health.js';

interface HealthIndicatorProps {
  readonly isFetching: boolean;
  readonly isError: boolean;
}

const Dot = ({ className, label }: { readonly className: string; readonly label: string }) => (
  <output data-slot="health-indicator" className="inline-flex" title={label}>
    <span aria-hidden="true" className={cn('inline-block size-2.5 rounded-full', className)} />
    <span className="sr-only">{label}</span>
  </output>
);

export const HealthIndicator = ({ isFetching, isError }: HealthIndicatorProps) => {
  const state = healthState({ isFetching, isError });
  const label = describeHealthState(state);

  return $match(state, {
    fetching: () => <Spinner data-slot="health-indicator" size="sm" title={label} />,
    ok: () => <Dot className="bg-green-500 animate-pulse" label={label} />,
    error: () => <Dot className="bg-destructive" label={label} />,
  });
};
