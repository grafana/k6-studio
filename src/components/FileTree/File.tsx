import { css } from '@emotion/react'
import { NavLink, useNavigate } from 'react-router-dom'

import { FileActionsMenu, FileContextMenu } from './FileContextMenu'
import { useRef, useState } from 'react'
import { Grid, Tooltip } from '@radix-ui/themes'
import { useOverflowCheck } from '@/hooks/useOverflowCheck'
import { useBoolean } from 'react-use'
import { InlineEditor } from './InlineEditor'
import { getViewPath } from '@/utils/file'
import { useStudioUIStore } from '@/store/ui'
import { FileItem } from './types'
import { HighlightedText } from '../HighlightedText'

interface FileProps {
  file: FileItem
  isSelected: boolean
}

const fileStyle = css`
  display: block;
  padding: var(--space-1) var(--space-2) var(--space-1) var(--space-5);
  font-size: 12px;
  line-height: 22px;
  color: var(--gray-11);
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
        columns="1fr auto"
        align="center"
        pr="4"
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
  const [displayName, setDisplayName] = useState(file.displayName)

  const addFile = useStudioUIStore((state) => state.addFile)
  const removeFile = useStudioUIStore((state) => state.removeFile)

  const navigate = useNavigate()

  const hasEllipsis = useOverflowCheck(linkRef)
  const fileExtension = file.fileName.split('.').pop()

  const handleSave = async (newValue: string) => {
    const newFileName = `${newValue}.${fileExtension}`

    await window.studio.ui.renameFile(file.fileName, newFileName, file.type)

    // There's a slight delay between the add and remove callbacks being triggered,
    // causing the UI to flicker because it thinks the renamed file is actually
    // a new file. To prevent this, we optimistically update the file list.
    removeFile(file)
    addFile({ ...file, fileName: newFileName })

    setDisplayName(newValue)
    setEditMode(false)

    if (isSelected) {
      navigate(getViewPath(file.type, newFileName))
    }
  }

  if (editMode) {
    return (
      <InlineEditor
        value={displayName}
        onSave={handleSave}
        onCancel={() => setEditMode(false)}
        style={fileStyle}
      />
    )
  }

  return (
    <Tooltip
      content={displayName}
      side="right"
      sideOffset={24}
      hidden={!hasEllipsis}
    >
      <NavLink
        ref={linkRef}
        css={[
          fileStyle,
          css`
            border-radius: 4px;
            font-weight: ${isSelected ? 700 : 400};
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
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
        to={getViewPath(file.type, file.fileName)}
      >
        <HighlightedText text={file.displayName} matches={file.matches} />
      </NavLink>
    </Tooltip>
  )
}

export function NoFileMessage({ message }: { message: string }) {
  return <span css={fileStyle}>{message}</span>
}
