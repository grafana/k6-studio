import { css } from '@emotion/react'
import { NavLink, useNavigate } from 'react-router-dom'

import { FileContextMenu } from './FileContextMenu'
import { useRef, useState } from 'react'
import { Tooltip } from '@radix-ui/themes'
import { useOverflowCheck } from '@/hooks/useOverflowCheck'
import { useBoolean } from 'react-use'
import { InlineEditor } from './InlineEditor'

interface FileProps {
  fileName: string
  viewPath: string
  isSelected: boolean
}

const fileStyle = css`
  display: block;
  padding: var(--space-1) var(--space-2) var(--space-1) var(--space-5);
  color: var(--gray-11);
  font-size: 12px;
  line-height: 22px;
`

export function File({ fileName, viewPath, isSelected }: FileProps) {
  const [editMode, setEditMode] = useBoolean(false)

  return (
    <FileContextMenu
      path={fileName}
      isSelected={isSelected}
      handleRename={() => setEditMode(true)}
    >
      <div>
        <EditableFile
          fileName={fileName}
          viewPath={viewPath}
          isSelected={isSelected}
          editMode={editMode}
          setEditMode={setEditMode}
        />
      </div>
    </FileContextMenu>
  )
}

function EditableFile({
  fileName,
  viewPath,
  isSelected,
  editMode,
  setEditMode,
}: FileProps & { editMode: boolean; setEditMode: (value: boolean) => void }) {
  const linkRef = useRef<HTMLAnchorElement>(null)
  const [displayName, setDisplayName] = useState(
    fileName.replace(/\.[^/.]+$/, '')
  )

  const hasEllipsis = useOverflowCheck(linkRef)
  const navigate = useNavigate()
  const fileExtension = fileName.split('.').pop()

  const handleSave = async (newValue: string) => {
    await window.studio.ui.renameFile(fileName, `${newValue}.${fileExtension}`)
    setDisplayName(newValue)
    setEditMode(false)

    if (isSelected) {
      navigate(`${viewPath}/${newValue}.${fileExtension}`)
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
    <Tooltip content={displayName} hidden={!hasEllipsis}>
      <NavLink
        ref={linkRef}
        css={[
          fileStyle,
          css`
            font-weight: ${isSelected ? 700 : 400};
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            text-decoration: none;

            &:hover {
              background-color: var(--gray-4);
            }

            &.active {
              color: var(--accent-9);
            }
          `,
        ]}
        to={`${viewPath}/${encodeURIComponent(fileName)}`}
      >
        {displayName}
      </NavLink>
    </Tooltip>
  )
}

export function NoFileMessage({ message }: { message: string }) {
  return <span css={fileStyle}>{message}</span>
}
