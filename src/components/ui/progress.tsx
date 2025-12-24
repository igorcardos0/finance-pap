'use client'

import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'

import { cn } from '@/lib/utils'

interface ProgressProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  style?: React.CSSProperties & {
    '--progress-indicator-color'?: string
  }
}

function Progress({
  className,
  value,
  style,
  ...props
}: ProgressProps) {
  const indicatorColor = style?.['--progress-indicator-color'] || 'var(--theme-primary, var(--primary))'
  
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        'bg-primary/20 relative h-2 w-full overflow-hidden rounded-full',
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "h-full w-full flex-1 transition-all",
          style?.['--progress-indicator-color'] === "#ef4444" && "bg-red-500",
          style?.['--progress-indicator-color'] === "#f59e0b" && "bg-orange-500"
        )}
        style={{
          transform: `translateX(-${100 - (value || 0)}%)`,
          backgroundColor: indicatorColor
        }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
