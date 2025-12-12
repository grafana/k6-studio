import { AlertDialog, Box, Button, Flex, Text } from '@radix-ui/themes'
import {
  cloneElement,
  isValidElement,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'

import { useToast } from '@/store/ui/useToast'
import { StudioFile } from '@/types'

import { FileNameHeader } from './FileNameHeader'

const FileTypeToLabel: Record<StudioFile['type'], string> = {
  recording: 'recording',
  generator: 'generator',
  script: 'script',
  'data-file': 'data file',
}

interface DeleteFileDialogProps {
  file: StudioFile
  trigger: ReactNode
  actionLabel?: string
  description?: string
  onDeleted?: () => void
}

export function DeleteFileDialog({
  file,
  trigger,
  actionLabel = 'Delete',
  description,
  onDeleted,
}: DeleteFileDialogProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const showToast = useToast()

  const handleOpenChange = (nextOpen: boolean) => {
    if (isDeleting) return
    setOpen(nextOpen)
  }

  const handleConfirm = async () => {
    try {
      setIsDeleting(true)
      await window.studio.ui.deleteFile(file)
      showToast({
        title: `${FileTypeToLabel[file.type]} deleted`,
        description: file.displayName,
        status: 'success',
      })
      onDeleted?.()
      setOpen(false)
    } catch (error) {
      console.error('Failed to delete file', error)
      showToast({
        title: 'Failed to delete file',
        description: file.displayName,
        status: 'error',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const wrappedTrigger = useMemo(() => {
    if (!isValidElement(trigger)) {
      return (
        <span
          onClick={(event) => {
            ;(event as { preventDefault?: () => void }).preventDefault?.()
            setOpen(true)
          }}
        >
          {trigger}
        </span>
      )
    }

    const node = trigger as ReactElement<{
      onClick?: (event: unknown) => void
      onSelect?: (event: unknown) => void
    }>

    const openDialog = (event: unknown) => {
      const e = event as {
        preventDefault?: () => void
        stopPropagation?: () => void
      }
      e.preventDefault?.()
      e.stopPropagation?.()
      setOpen(true)
    }

    return cloneElement(node, {
      ...node.props,
      onClick: (event: unknown) => {
        node.props.onClick?.(event)
        if ((event as { defaultPrevented?: boolean })?.defaultPrevented) {
          return
        }
        openDialog(event)
      },
      onSelect: (event: unknown) => {
        node.props.onSelect?.(event)
        if ((event as { defaultPrevented?: boolean })?.defaultPrevented) {
          return
        }
        openDialog(event)
      },
    })
  }, [trigger])

  return (
    <AlertDialog.Root open={open} onOpenChange={handleOpenChange}>
      <AlertDialog.Trigger>{wrappedTrigger}</AlertDialog.Trigger>
      <AlertDialog.Content size="2" maxWidth="480px">
        <AlertDialog.Title size="3">
          Delete {FileTypeToLabel[file.type]}
        </AlertDialog.Title>
        <AlertDialog.Description size="2" mb="3">
          {description ?? 'This action cannot be undone.'}
        </AlertDialog.Description>

        <Box mb="3">
          <Text size="2" color="gray">
            File
          </Text>
          <FileNameHeader file={file} canRename={false} showExt />
        </Box>

        <Flex gap="3" mt="4" justify="end">
          <AlertDialog.Cancel>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button
              variant="solid"
              color="red"
              onClick={handleConfirm}
              loading={isDeleting}
            >
              {actionLabel}
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  )
}
