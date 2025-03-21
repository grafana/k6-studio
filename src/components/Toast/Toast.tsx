import {
  CheckCircledIcon,
  Cross2Icon,
  CrossCircledIcon,
} from '@radix-ui/react-icons'
import { Box, IconButton } from '@radix-ui/themes'

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
          <Cross2Icon width="12px" height="12px" />
        </IconButton>
      </ToastClose>
    </ToastRoot>
  )
}

function StatusIcon({ status }: { status: ToastProps['status'] }) {
  switch (status) {
    case 'success':
      return <CheckCircledIcon color="green" width="25px" height="25px" />
    case 'error':
      return <CrossCircledIcon color="red" width="25px" height="25px" />
    case 'default':
      return null
    default:
      return exhaustive(status)
  }
}
