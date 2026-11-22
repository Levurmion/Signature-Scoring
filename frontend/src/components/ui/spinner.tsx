import { type VariantProps, cva } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

const spinnerVariants = cva('animate-spin text-muted-foreground', {
  variants: {
    size: {
      default: 'size-4',
      sm: 'size-3',
      lg: 'size-6',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

const Spinner = ({
  className,
  size,
  ...props
}: ComponentProps<'output'> & VariantProps<typeof spinnerVariants>) => (
  <output data-slot="spinner" className={cn('inline-flex', className)} {...props}>
    <Loader2 aria-hidden="true" className={spinnerVariants({ size })} />
  </output>
);

export { Spinner, spinnerVariants };
