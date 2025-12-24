/**
 * Toast notification utilities
 * Wrapper around sonner for consistent toast usage across the app
 */

import { toast as sonnerToast } from 'sonner'

export const toast = {
  success: (message: string, description?: string) => {
    return sonnerToast.success(message, {
      description,
      duration: 3000,
    })
  },
  error: (message: string, description?: string) => {
    return sonnerToast.error(message, {
      description,
      duration: 4000,
    })
  },
  info: (message: string, description?: string) => {
    return sonnerToast.info(message, {
      description,
      duration: 3000,
    })
  },
  warning: (message: string, description?: string) => {
    return sonnerToast.warning(message, {
      description,
      duration: 3000,
    })
  },
  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: Error) => string)
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
    })
  },
}

