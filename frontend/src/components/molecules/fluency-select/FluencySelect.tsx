import type { ComponentProps } from 'react';
import { Option } from 'effect';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import { FLUENCY_LEVELS, type Fluency } from './fluency-levels';

type FluencySelectProps = Omit<
  ComponentProps<typeof SelectTrigger>,
  'value' | 'defaultValue' | 'onChange' | 'children'
> & {
  readonly value: Fluency | null;
  readonly onValueChange: (value: Fluency) => void;
  readonly name?: string;
};

const fluencyFromRaw = (raw: string): Option.Option<Fluency> =>
  Option.fromNullishOr(FLUENCY_LEVELS.find((level) => String(level.value) === raw)).pipe(
    Option.map((level) => level.value),
  );

const selectedValue = (value: Fluency | null): string =>
  Option.match(Option.fromNullishOr(value), {
    onNone: () => '',
    onSome: (fluency) => String(fluency),
  });

export const FluencySelect = ({
  value,
  onValueChange,
  name,
  className,
  ...triggerProps
}: FluencySelectProps) => (
  <Select
    name={name}
    value={selectedValue(value)}
    onValueChange={(raw) => {
      Option.match(fluencyFromRaw(raw), {
        onNone: () => undefined,
        onSome: onValueChange,
      });
    }}
  >
    <SelectTrigger className={cn('w-full', className)} {...triggerProps}>
      <SelectValue placeholder="Select a fluency level" />
    </SelectTrigger>
    <SelectContent position="popper">
      {FLUENCY_LEVELS.map((level) => (
        <SelectItem key={level.value} value={String(level.value)}>
          {level.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);
