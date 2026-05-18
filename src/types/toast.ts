export interface Toast {
  id: string
  open: boolean
  status: 'default' | 'success' | 'error'
  title: string
  description?: string
  action?: React.ReactNode
  onDismiss?: () => void
}

export type AddToastPayload = Omit<Toast, 'id' | 'open' | 'status'> & {
  status?: Toast['status']
}
