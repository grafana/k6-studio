import { Badge, Heading, Tooltip } from '@radix-ui/themes'
import { useRef } from 'react'

import { useOverflowCheck } from '@/hooks/useOverflowCheck'
import { StudioFile } from '@/types'
import { getFileExtension } from '@/utils/file'

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

      {showExt && !!fileExtension && (
        <Badge color="gray" size="1">
          {fileExtension.toUpperCase()}
        </Badge>
      )}
    </>
  )
}
