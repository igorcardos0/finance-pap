'use client'

import { Toaster as Sonner, ToasterProps } from 'sonner'
import { useTheme } from '@/hooks/use-theme'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme()

  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: 'group toast group-[.toaster]:bg-zinc-900 group-[.toaster]:text-zinc-100 group-[.toaster]:border-zinc-800 group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-zinc-400',
          actionButton: 'group-[.toast]:bg-theme-primary group-[.toast]:text-zinc-950',
          cancelButton: 'group-[.toast]:bg-zinc-800 group-[.toast]:text-zinc-400',
        },
        style: {
          '--normal-bg': 'rgb(24, 24, 27)',
          '--normal-text': 'rgb(244, 244, 245)',
          '--normal-border': 'rgb(39, 39, 42)',
        } as React.CSSProperties,
      }}
      {...props}
    />
  )
}

export { Toaster }
