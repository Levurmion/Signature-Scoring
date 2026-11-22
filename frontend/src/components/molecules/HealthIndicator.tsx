import { Spinner } from '@/components/ui/spinner';
import { $match, describeHealthState, healthState } from '@/lib/health';
import { cn } from '@/lib/utils';

interface HealthIndicatorProps {
  readonly isFetching: boolean;
  readonly isError: boolean;
}

/** A small status dot, announced to screen readers via `<output>` + `title`/sr-only text. */
const Dot = ({ className, label }: { readonly className: string; readonly label: string }) => (
  <output data-slot="health-indicator" className="inline-flex" title={label}>
    <span aria-hidden="true" className={cn('inline-block size-2.5 rounded-full', className)} />
    <span className="sr-only">{label}</span>
  </output>
);

/**
 * Summarizes the API health check as a spinner (fetching), a pulsing green dot (ok), or a red
 * dot (error). Pass the flags straight off a TanStack Query result, e.g.
 * `<HealthIndicator isFetching={health.isFetching} isError={health.isError} />`.
 */
export const HealthIndicator = ({ isFetching, isError }: HealthIndicatorProps) => {
  const state = healthState({ isFetching, isError });
  const label = describeHealthState(state);

  return $match(state, {
    fetching: () => <Spinner data-slot="health-indicator" size="sm" title={label} />,
    ok: () => <Dot className="animate-pulse bg-green-500" label={label} />,
    error: () => <Dot className="bg-destructive" label={label} />,
  });
};
