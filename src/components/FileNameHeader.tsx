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
  }, [file.displayName, reset, isOpen])

  const onSubmit = async ({ fileName }: { fileName: string }) => {
    if (!isDirty) return

    await mutateAsync(`${fileName.trim()}.${fileExtension}`)
    setIsOpen(false)
  }

  return (
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
  )
}
