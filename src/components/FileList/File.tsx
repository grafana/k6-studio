import { css } from '@emotion/react'
import { Grid, Tooltip } from '@radix-ui/themes'
import {
  FileBracesIcon,
  FileQuestionMarkIcon,
  FileSpreadsheetIcon,
  MonitorIcon,
  ServerCogIcon,
  VideoIcon,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useBoolean } from 'react-use'

import { UpdateReferencesDialog } from '@/components/UpdateReferencesDialog'
import { useOverflowCheck } from '@/hooks/useOverflowCheck'
import { useRenameFile } from '@/hooks/useRenameFile'
import { getViewPath } from '@/routeMap'
import * as path from '@/utils/path'

import { HighlightedText } from '../HighlightedText'

import { FileActionsMenu, FileContextMenu } from './FileContextMenu'
import { InlineEditor } from './InlineEditor'
import { FileItem } from './types'

interface FileProps {
  file: FileItem
  isSelected: boolean
}

const fileStyle = css`
  display: block;
  padding: var(--space-1) var(--space-2);
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
        columns="min-content 1fr auto"
        align="center"
        pl="3"
        pr="2"
        css={css`
          & > button {
            opacity: 0;
            width: 0;
            overflow: hidden;
            padding-inline: 0;
            pointer-events: none;
          }

          &:hover > button,
          & > button:focus,
          & > button[data-state='open'] {
            opacity: 1;
            width: auto;
            overflow: visible;
            padding-inline: revert;
            pointer-events: auto;
          }

          &:hover {
            background-color: var(--gray-a2);
          }
        `}
      >
        <FileIcon file={file} />
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
  const inlineInputRef = useRef<HTMLInputElement>(null)

  const hasEllipsis = useOverflowCheck(linkRef)
  const confirmedRef = useRef(false)

  const { mutateAsync: renameFile } = useRenameFile(file)

  const [pendingRename, setPendingRename] = useState<{
    newName: string
    references: string[]
  } | null>(null)

  const fileExtension = path.extname(file.fileName).slice(1)

  const handleSave = async (newValue: string) => {
    const newFileName = `${newValue.trim()}.${fileExtension}`
    const result = await renameFile({ newName: newFileName })

    if (result.renamed) {
      setEditMode(false)
      return
    }

    setPendingRename({ newName: newFileName, references: result.references })
  }

  const handleConfirmRename = async (onReferenced: 'force' | 'update') => {
    if (pendingRename === null) {
      return
    }

    confirmedRef.current = true

    const result = await renameFile({
      newName: pendingRename.newName,
      onReferenced,
    })

    if (result.renamed) {
      setPendingRename(null)
      setEditMode(false)
    }
  }

  const handleCancelDialog = () => {
    setPendingRename(null)
  }

  const handleCloseAutoFocus = (ev: Event) => {
    if (!confirmedRef.current) {
      ev.preventDefault()
      inlineInputRef.current?.focus()
    }

    confirmedRef.current = false
  }

  if (editMode) {
    return (
      <>
        <InlineEditor
          ref={inlineInputRef}
          value={file.displayName}
          onSave={handleSave}
          onCancel={() => {
            if (pendingRename !== null) {
              handleCancelDialog()
            }
            setEditMode(false)
          }}
          style={fileStyle}
          disableClickAway={pendingRename !== null}
        />
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
        to={getViewPath(file.path)}
      >
        <HighlightedText text={file.displayName} matches={file.matches} />
      </NavLink>
    </Tooltip>
  )
}

export function NoFileMessage({ message }: { message: string }) {
  return <span css={fileStyle}>{message}</span>
}

function FileIcon({ file }: { file: FileItem }) {
  if (file.type === 'recording') {
    return <VideoIcon aria-hidden color="var(--accent-9)" />
  }

  if (file.type === 'generator') {
    return <ServerCogIcon aria-label="HTTP test" color="var(--accent-9)" />
  }

  if (file.type === 'browser-test') {
    return <MonitorIcon aria-label="Browser test" color="var(--indigo-9)" />
  }

  if (file.type === 'script') {
    return <FileBracesIcon aria-hidden color="var(--accent-9)" />
  }

  if (file.type === 'data-file' && file.fileName.endsWith('.json')) {
    return (
      <FileBracesIcon aria-label="JSON data file" color="var(--indigo-9)" />
    )
  }

  if (file.type === 'data-file') {
    return (
      <FileSpreadsheetIcon
        aria-label="Spreadsheet data file"
        color="var(--accent-9)"
      />
    )
  }

  return (
    <FileQuestionMarkIcon
      aria-label="Unknown file type"
      color="var(--gray-9)"
    />
  )
}
