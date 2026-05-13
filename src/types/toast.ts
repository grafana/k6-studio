export interface Toast {
  id: string
  status: 'default' | 'success' | 'error'
  title: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  onDismiss?: () => void
}

export type AddToastPayload = Omit<Toast, 'id' | 'status'> & {
  status?: Toast['status']
}
