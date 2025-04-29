import { Box, IconButton } from '@radix-ui/themes'
import { CircleCheckIcon, CircleXIcon, XIcon } from 'lucide-react'

import { Toast as ToastProps } from '@/types/toast'
import { exhaustive } from '@/utils/typescript'

import {
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastIcon,
  ToastRoot,
  ToastTitle,
} from './Toast.styles'

export function Toast({ toast }: { toast: ToastProps }) {
  return (
    <ToastRoot>
      {toast.status !== 'default' && (
        <ToastIcon>
          <StatusIcon status={toast.status} />
        </ToastIcon>
      )}
      <Box flexGrow="1">
        <ToastTitle>{toast.title}</ToastTitle>
        {toast.description && (
          <ToastDescription>{toast.description}</ToastDescription>
        )}
      </Box>
      {toast.action && (
        <ToastAction asChild altText={toast.title}>
          {toast.action}
        </ToastAction>
      )}
      <ToastClose asChild className="close-button">
        <IconButton variant="outline" color="gray" radius="full" size="1">
          <XIcon />
        </IconButton>
      </ToastClose>
    </ToastRoot>
  )
}

function StatusIcon({ status }: { status: ToastProps['status'] }) {
  switch (status) {
    case 'success':
      return <CircleCheckIcon color="var(--green-11)" />
    case 'error':
      return <CircleXIcon color="var(--red-11)" />
    case 'default':
      return null
    default:
      return exhaustive(status)
  }
}
