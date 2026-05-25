import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

type SpinnerProps = HTMLAttributes<HTMLSpanElement>;

export function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <span
      aria-hidden="true"
      {...props}
      className={cn(
        'inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent',
        className
      )}
    />
  );
}
