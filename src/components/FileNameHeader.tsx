import { Pencil1Icon } from '@radix-ui/react-icons'
import {
  Badge,
  Button,
  Dialog,
  Flex,
  Heading,
  IconButton,
  TextField,
  Tooltip,
} from '@radix-ui/themes'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { useOverflowCheck } from '@/hooks/useOverflowCheck'
import { useRenameFile } from '@/hooks/useRenameFile'
import { StudioFile } from '@/types'
import { getFileExtension } from '@/utils/file'

import { FieldGroup } from './Form'

const FileTypeToLabel: Record<StudioFile['type'], string> = {
  recording: 'recording',
  generator: 'generator',
  script: 'script',
  'data-file': 'data file',
}

interface FileNameHeaderProps {
  file: StudioFile
  isDirty?: boolean
  showExt?: boolean
}

export function FileNameHeader({
  file,
  isDirty = false,
  showExt = false,
}: FileNameHeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const subTitleRef = useRef<HTMLHeadingElement>(null)
  const hasEllipsis = useOverflowCheck(subTitleRef)
  const fileExtension = getFileExtension(file.fileName)

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

      <Tooltip content={`Rename ${FileTypeToLabel[file.type]}`}>
        <IconButton
          variant="ghost"
          size="1"
          color="gray"
          aria-label={`Rename ${FileTypeToLabel[file.type]}`}
          onClick={() => setIsOpen(true)}
        >
          <Pencil1Icon />
        </IconButton>
      </Tooltip>

      <RenameFileDialog file={file} open={isOpen} onOpenChange={setIsOpen} />

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
  open: boolean
  onOpenChange: (open: boolean) => void
}

function RenameFileDialog({ file, open, onOpenChange }: RenameFileDialogProps) {
  const { mutateAsync, isPending } = useRenameFile(file)
  const fileExtension = getFileExtension(file.fileName)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<{ fileName: string }>({
    defaultValues: {
      fileName: file.displayName,
    },
    shouldFocusError: false,
  })

  useEffect(() => {
    reset({ fileName: file.displayName })
  }, [file.displayName, reset, open])

  const onSubmit = async ({ fileName }: { fileName: string }) => {
    if (!isDirty) return

    await mutateAsync(`${fileName.trim()}.${fileExtension}`)
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content size="1">
        <Dialog.Title>Rename {FileTypeToLabel[file.type]}</Dialog.Title>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup label="New name" name="fileName" errors={errors}>
            <TextField.Root
              placeholder="http://example.com:6000"
              {...register('fileName')}
            />
          </FieldGroup>
          <Flex justify="end" gap="2">
            <Dialog.Close>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Dialog.Close>
            <Button disabled={!isDirty} loading={isPending} type="submit">
              Rename
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  )
}
