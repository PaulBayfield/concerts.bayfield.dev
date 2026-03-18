// Minimal stub - using sonner instead
export interface Toast {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  [key: string]: unknown
}

export function useToast() {
  return {
    toast: (_props: Partial<Toast>) => {},
    dismiss: (_id?: string) => {},
    toasts: [] as Toast[],
  }
}
