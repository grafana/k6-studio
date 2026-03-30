import { css } from '@emotion/react'
import {
  DatabaseIcon,
  FileArchiveIcon,
  FileCodeIcon,
  FileCogIcon,
  FileIcon,
  LucideProps,
  MonitorIcon,
} from 'lucide-react'

import { FileType } from '@/types'

export interface FileEntryIconProps extends LucideProps {
  fileType: FileType | undefined
}

export function FileEntryIcon({ fileType, ...props }: FileEntryIconProps) {
  switch (fileType) {
    case 'script':
      return (
        <FileCodeIcon
          css={css`
            color: var(--yellow-11);
          `}
          {...props}
        />
      )

    case 'recording':
      return (
        <FileArchiveIcon
          css={css`
            color: var(--green-11);
          `}
          {...props}
        />
      )

    case 'browser-test':
      return (
        <MonitorIcon
          css={css`
            color: var(--blue-11);
          `}
          {...props}
        />
      )

    case 'generator':
      return (
        <FileCogIcon
          css={css`
            color: var(--orange-11);
          `}
          {...props}
        />
      )

    case 'json':
    case 'csv':
      return <DatabaseIcon {...props} />

    default:
      return <FileIcon {...props} />
  }
}
