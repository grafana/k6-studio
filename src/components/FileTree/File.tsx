import { css } from '@emotion/react'
import { Flex, Grid, Tooltip } from '@radix-ui/themes'
import { useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { useBoolean } from 'react-use'

import { useOverflowCheck } from '@/hooks/useOverflowCheck'
import { useRenameFile } from '@/hooks/useRenameFile'
import { getFileExtension, getViewPath } from '@/utils/file'

import { HighlightedText } from '../HighlightedText'

import { FileActionsMenu, FileContextMenu } from './FileContextMenu'
import { FileEntryIcon } from './FileEntryIcon'
import { InlineEditor } from './InlineEditor'
import { FileItem } from './types'

interface FileProps {
  file: FileItem
  isSelected: boolean
}

const fileRowStyle = css`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
  padding: var(--file-entry-spacing) var(--file-entry-spacing)
    var(--file-entry-spacing) var(--space-4);
  font-size: 12px;
  color: var(--gray-11);
`

const fileStyle = css`
  flex: 1 1 0;
  min-width: 0;
`

export function File({ file, isSelected }: FileProps) {
  const [editMode, setEditMode] = useBoolean(false)

  return (
    <FileContextMenu
      file={file}
      isSelected={isSelected}
      onRename={() => setEditMode(true)}
    >
      <Grid
        className="file-item"
        columns="1fr auto"
        align="center"
        css={css`
          & > button {
            opacity: 0;
          }

          &:hover > button,
          & > button:focus,
          & > button[data-state='open'] {
            opacity: 1;
          }

          &:hover {
            background-color: var(--gray-4);
          }
        `}
        pr="1"
      >
        <EditableFile
          file={file}
          isSelected={isSelected}
          editMode={editMode}
          setEditMode={setEditMode}
        />
        <FileActionsMenu
          file={file}
          isSelected={isSelected}
          onRename={() => setEditMode(true)}
        />
      </Grid>
    </FileContextMenu>
  )
}

function EditableFile({
  file,
  isSelected,
  editMode,
  setEditMode,
}: FileProps & { editMode: boolean; setEditMode: (value: boolean) => void }) {
  const linkRef = useRef<HTMLAnchorElement>(null)
  const hasEllipsis = useOverflowCheck(linkRef)

  const { mutateAsync: renameFile } = useRenameFile(file)

  const fileExtension = getFileExtension(file.fileName)

  const handleSave = async (newValue: string) => {
    const newFileName = `${newValue.trim()}.${fileExtension}`
    await renameFile(newFileName)
    setEditMode(false)
  }

  if (editMode) {
    return (
      <Flex align="center" gap="1" css={fileRowStyle} minWidth="0">
        <FileEntryIcon
          fileType={file.type}
          size={16}
          css={css`
            flex-shrink: 0;
          `}
        />
        <InlineEditor
          value={file.displayName}
          onSave={handleSave}
          onCancel={() => setEditMode(false)}
          style={[
            fileStyle,
            css`
              flex: 1 1 0;
              min-width: 0;
            `,
          ]}
        />
      </Flex>
    )
  }

  return (
    <Tooltip
      content={file.displayName}
      side="right"
      sideOffset={24}
      hidden={!hasEllipsis}
    >
      <NavLink
        ref={linkRef}
        css={[
          fileRowStyle,
          fileStyle,
          css`
            border-radius: 4px;
            font-weight: ${isSelected ? 700 : 400};
            text-decoration: none;

            &:focus-visible {
              outline: 2px solid var(--focus-8);
              outline-offset: -1px;
            }

            &.active {
              color: var(--accent-9);
            }
          `,
        ]}
        to={getViewPath(file.path)}
      >
        <FileEntryIcon
          fileType={file.type}
          size={16}
          css={css`
            flex-shrink: 0;
          `}
        />
        <span
          css={css`
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            min-width: 0;
          `}
        >
          <HighlightedText text={file.displayName} matches={file.matches} />
        </span>
      </NavLink>
    </Tooltip>
  )
}

export function NoFileMessage({ message }: { message: string }) {
  return (
    <span
      css={css`
        display: block;
        padding: var(--space-1) var(--space-1) var(--space-1) var(--space-4);
        font-size: 12px;
        color: var(--gray-11);
      `}
    >
      {message}
    </span>
  )
}
