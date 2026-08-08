import {
  Badge,
  Button,
  Flex,
  Heading,
  IconButton,
  Popover,
  TextField,
  Tooltip,
} from '@radix-ui/themes'
import { PencilIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { UpdateReferencesDialog } from '@/components/UpdateReferencesDialog'
import { FileTypeToLabel } from '@/constants/files'
import { useOverflowCheck } from '@/hooks/useOverflowCheck'
import { useRenameFile } from '@/hooks/useRenameFile'
import { StudioFile } from '@/types'
import * as path from '@/utils/path'

import { FieldGroup } from './Form'

interface FileNameHeaderProps {
  file: StudioFile
  canRename?: boolean
  isDirty?: boolean
  showExt?: boolean
}

export function FileNameHeader({
  file,
  canRename = true,
  isDirty = false,
  showExt = false,
}: FileNameHeaderProps) {
  const subTitleRef = useRef<HTMLHeadingElement>(null)
  const hasEllipsis = useOverflowCheck(subTitleRef)
  const fileExtension = path.extname(file.fileName).slice(1)

  return (
    <>
      <Tooltip content={file.displayName} hidden={!hasEllipsis}>
        <Heading
          size="2"
          weight="medium"
          color="gray"
          truncate
          ref={subTitleRef}
        >
          {file.displayName}
        </Heading>
      </Tooltip>

      {isDirty && (
        <Tooltip content="Unsaved changes">
          <span aria-label="Unsaved changes">*</span>
        </Tooltip>
      )}

      {canRename && <RenameFileDialog file={file} />}

      {showExt && !!fileExtension && (
        <Badge color="gray" size="1">
          {fileExtension.toUpperCase()}
        </Badge>
      )}
    </>
  )
}

interface RenameFileDialogProps {
  file: StudioFile
}

function RenameFileDialog({ file }: RenameFileDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [pendingRename, setPendingRename] = useState<{
    newName: string
    references: string[]
  } | null>(null)
  const { mutateAsync, isPending } = useRenameFile(file)

  const fileExtension = path.extname(file.fileName)
  const confirmedRef = useRef(false)

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors, isDirty },
  } = useForm<{ fileName: string }>({
    defaultValues: {
      fileName: file.displayName,
    },
    shouldFocusError: false,
  })

  useEffect(() => {
    reset({ fileName: file.displayName })
  }, [file.displayName, reset, isOpen])

  const onSubmit = async ({ fileName }: { fileName: string }) => {
    if (!isDirty) {
      return
    }

    const newName = `${fileName.trim()}${fileExtension}`

    const result = await mutateAsync({
      newName,
    })

    if (result.renamed) {
      setIsOpen(false)

      return
    }

    setPendingRename({
      newName,
      references: result.references,
    })
  }

  const handleConfirmRename = async (onReferenced: 'force' | 'update') => {
    if (!pendingRename) {
      return
    }

    confirmedRef.current = true

    const result = await mutateAsync({
      newName: pendingRename.newName,
      onReferenced,
    })

    if (result.renamed) {
      setPendingRename(null)
      setIsOpen(false)
    }
  }

  const handleCancelDialog = () => {
    setPendingRename(null)
  }

  const handleCloseAutoFocus = (e: Event) => {
    if (!confirmedRef.current) {
      e.preventDefault()
      setFocus('fileName')
    }
    confirmedRef.current = false
  }

  return (
    <>
      <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip content={`Rename ${FileTypeToLabel[file.type]}`}>
          <Popover.Trigger>
            <IconButton
              variant="ghost"
              size="1"
              color="gray"
              aria-label={`Rename ${FileTypeToLabel[file.type]}`}
              onClick={() => setIsOpen(true)}
            >
              <PencilIcon />
            </IconButton>
          </Popover.Trigger>
        </Tooltip>
        <Popover.Content size="1" width="400px" side="bottom" align="end">
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup label="New name" name="fileName" errors={errors}>
              <TextField.Root
                placeholder="http://example.com:6000"
                {...register('fileName')}
              />
            </FieldGroup>
            <Flex justify="end" gap="2">
              <Popover.Close>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Popover.Close>
              <Button disabled={!isDirty} loading={isPending} type="submit">
                Rename
              </Button>
            </Flex>
          </form>
        </Popover.Content>
      </Popover.Root>
      <UpdateReferencesDialog
        open={pendingRename !== null}
        filePath={file.path}
        references={pendingRename?.references ?? []}
        onRename={() => void handleConfirmRename('force')}
        onUpdateAndRename={() => void handleConfirmRename('update')}
        onCancel={handleCancelDialog}
        onCloseAutoFocus={handleCloseAutoFocus}
      />
    </>
  )
}
