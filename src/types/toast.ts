export interface Toast {
  id: string
  status: 'default' | 'success' | 'error'
  title: string
  description?: string
  action?: React.ReactNode
}

export type AddToastPayload = Omit<Toast, 'id' | 'status'> & {
  status?: Toast['status']
}
