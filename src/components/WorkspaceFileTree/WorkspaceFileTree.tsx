import { css } from '@emotion/react'
import {
  ContextMenu,
  DropdownMenu,
  Flex,
  IconButton,
  Reset,
  Tooltip,
} from '@radix-ui/themes'
import Fuse, { IFuseOptions } from 'fuse.js'
import { FolderClosedIcon, FolderOpenIcon, PlusIcon } from 'lucide-react'
import * as pathe from 'pathe'
import { KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, useNavigate, useParams } from 'react-router-dom'

import { DeleteFileDialog } from '@/components/DeleteFileDialog'
import { FileEntryIcon } from '@/components/FileTree/FileEntryIcon'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import type {
  DirectoryEntry,
  FileContent,
  FileEntry,
  FileOnDisk,
  SubDirectoryEntry,
} from '@/handlers/file/types'
import { useDeleteFile } from '@/hooks/useDeleteFile'
import { useFeaturesStore } from '@/store/features'
import { FileType } from '@/types'
import { getViewPath, inferFileTypeFromExtension } from '@/utils/file'
import { createNewGeneratorFile } from '@/utils/generator'

import { TreeItem, useTree } from './WorkspaceFileTree.hooks'

const entryStyles = css`
  --spacing: calc(var(--space-1) * 1.5);

  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--file-entry-spacing) var(--file-entry-spacing)
    var(--file-entry-spacing) var(--space-4);

  font-size: 12px;
  color: var(--gray-11);

  font-weight: 400;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-decoration: none;

  &:hover {
    background-color: var(--gray-4);
  }

  &:focus-visible {
    outline: 2px solid var(--focus-8);
    outline-offset: -1px;
  }
`

interface WorkspaceFileTreeInputProps {
  value: string
  selectionRange: [number, number]
  onChange: (value: string) => void
  onCommit: (value: string) => void
  onCancel: () => void
}

function WorkspaceFileTreeInput({
  value,
  selectionRange,
  onChange,
  onCommit,
  onCancel,
}: WorkspaceFileTreeInputProps) {
  const isInitializedRef = useRef(false)

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()

      onCancel()

      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()

      onCommit(value)

      return
    }
  }

  const handleBlur = () => {
    if (value.trim() === '') {
      onCancel()

      return
    }

    onCommit(value)
  }

  const handleMount = (el: HTMLInputElement | null) => {
    if (el === null || isInitializedRef.current) {
      return
    }

    el.setSelectionRange(...selectionRange)
    el.focus()

    isInitializedRef.current = true
  }

  return (
    <input
      ref={handleMount}
      type="text"
      css={css`
        font-size: 12px;
        line-height: 18px;
        box-sizing: border-box;
        padding: var(--space-1) var(--space-2) var(--space-1) 0;
        color: var(--gray-11);
        font-weight: 400;
        background: var(--gray-3);
        border: none;
        flex: 1 1 0;
      `}
      value={value}
      onChange={(event) => {
        onChange(event.target.value)
      }}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    />
  )
}

const createContentForType = (type: FileType): FileContent | null => {
  switch (type) {
    case 'browser-test': {
      return {
        type: 'browser-test',
        data: {
          version: '1.0',
          actions: [],
        },
      }
    }

    case 'generator': {
      return {
        type: 'generator',
        data: createNewGeneratorFile(),
      }
    }

    default: {
      return null
    }
  }
}
interface NewFileItemProps {
  item: TreeItem<FileTreeEntry>
  entry: NewFileEntry
  onCreate: (content: {
    entry: NewFileEntry
    name: string
    content: FileContent
  }) => void
  onCancel: (entry: NewFileEntry) => void
}

function NewFileItem({ item, entry, onCreate, onCancel }: NewFileItemProps) {
  const [value, setValue] = useState(entry.hint)

  const nameWithoutExtension = pathe.basename(
    entry.hint,
    pathe.extname(entry.hint)
  )

  const inferredFileType = inferFileTypeFromExtension(value)

  const handleCreate = () => {
    const content = createContentForType(inferredFileType)

    if (content === null) {
      return
    }

    onCreate({ entry, name: value, content })
  }

  return (
    <div
      css={[
        entryStyles,
        css`
          padding-top: 0;
          padding-bottom: 0;
          overflow: visible;
        `,
      ]}
      style={{ paddingLeft: `${(item.level + 1) * 16}px` }}
    >
      <Flex align="center" gap="1" width="100%">
        <FileEntryIcon fileType={inferredFileType} size={16} />
        <WorkspaceFileTreeInput
          value={value}
          selectionRange={[0, nameWithoutExtension.length]}
          onChange={setValue}
          onCommit={handleCreate}
          onCancel={() => onCancel(entry)}
        />
      </Flex>
    </div>
  )
}

interface NewTestMenuProps {
  tabIndex: number
  onNewFile: (fileType: 'browser-test' | 'generator') => void
}

export function NewTestMenu({ onNewFile }: NewTestMenuProps) {
  const [open, setOpen] = useState(false)

  const isBrowserEditorEnabled = useFeaturesStore(
    (state) => state.features['browser-test-editor']
  )

  if (!isBrowserEditorEnabled) {
    return (
      <Tooltip content="New generator" side="right">
        <IconButton
          aria-label="New generator"
          variant="ghost"
          size="1"
          color="gray"
          onClick={(event) => {
            event.preventDefault()

            onNewFile('generator')
          }}
        >
          <PlusIcon />
        </IconButton>
      </Tooltip>
    )
  }

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger className="dropdown-menu-trigger">
        <IconButton aria-label="New test" variant="ghost" color="gray" size="1">
          <PlusIcon />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content side="right" align="start" size="1">
        <DropdownMenu.Item
          onSelect={(event) => {
            event.preventDefault()

            onNewFile('generator')
            setOpen(false)
          }}
        >
          HTTP test
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onSelect={(event) => {
            event.preventDefault()

            onNewFile('browser-test')
            setOpen(false)
          }}
        >
          Browser test
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

interface DirectoryEntryProps {
  entry: SubDirectoryEntry
  item: TreeItem<FileTreeEntry>
  onNewFile: (item: TreeItem<FileTreeEntry>, entry: NewFileEntry) => void
  onRefreshDirectory: (path: string) => void | Promise<void>
}

function DirectoryItem({
  entry,
  item,
  onNewFile,
  onRefreshDirectory,
}: DirectoryEntryProps) {
  const [isRenaming, setIsRenaming] = useState(false)
  const [value, setValue] = useState(entry.basename)

  const parentPath = pathe.dirname(entry.path)

  const handleRename = async () => {
    const trimmed = value.trim()

    if (trimmed === '' || trimmed === entry.basename) {
      setIsRenaming(false)
      setValue(entry.basename)

      return
    }

    try {
      await window.studio.ui.renameFile(entry.path, trimmed)
      await onRefreshDirectory(parentPath)
      setIsRenaming(false)
    } catch (error) {
      console.error(error)
    }
  }

  if (isRenaming) {
    return (
      <div
        css={[
          entryStyles,
          css`
            padding-top: 0;
            padding-bottom: 0;
            overflow: visible;
          `,
        ]}
        style={{ paddingLeft: (item.level + 1) * 16 }}
      >
        <Flex align="center" gap="1" width="100%">
          {item.expanded ? (
            <FolderOpenIcon size={16} />
          ) : (
            <FolderClosedIcon size={16} />
          )}
          <WorkspaceFileTreeInput
            value={value}
            selectionRange={[0, entry.basename.length]}
            onChange={setValue}
            onCommit={handleRename}
            onCancel={() => setIsRenaming(false)}
          />
        </Flex>
      </div>
    )
  }

  return (
    <>
      <ContextMenu.Root>
        <ContextMenu.Trigger>
          <div
            css={[
              entryStyles,
              css`
                padding: 0;
                padding-right: var(--space-1);

                & > .dropdown-menu-trigger {
                  visibility: hidden;
                }

                &:hover > .dropdown-menu-trigger,
                &:focus-within > .dropdown-menu-trigger,
                & > .dropdown-menu-trigger[data-state='open'] {
                  visibility: visible;
                }
              `,
            ]}
            {...item.props.aria}
            {...item.props.control}
          >
            <Reset key={entry.path}>
              <button
                tabIndex={-1}
                type="button"
                css={[
                  entryStyles,
                  css`
                    flex: 1 1 0;
                  `,
                ]}
                style={{ paddingLeft: (item.level + 1) * 16 }}
                onClick={() => item.toggle()}
              >
                {item.expanded ? (
                  <FolderOpenIcon size={16} />
                ) : (
                  <FolderClosedIcon size={16} />
                )}
                <span
                  css={css`
                    flex: 1 1 0;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                  `}
                >
                  {entry.basename}
                </span>
              </button>
            </Reset>
            <NewTestMenu
              tabIndex={item.props.aria.tabIndex}
              onNewFile={(type) => {
                onNewFile(item, {
                  type: 'new-file',
                  path: newFileId,
                  hint:
                    type === 'browser-test'
                      ? 'browser-test.k6b'
                      : 'generator.k6g',
                  dirname: entry.path,
                  fileType: type,
                })
              }}
            />
          </div>
        </ContextMenu.Trigger>
        <ContextMenu.Content size="1">
          <ContextMenu.Item onSelect={() => setIsRenaming(true)}>
            Rename
          </ContextMenu.Item>
          <ContextMenu.Item
            onSelect={() =>
              window.studio.ui.openContainingFolder({
                type: 'recording',
                path: entry.path,
                fileName: entry.basename,
                displayName: entry.basename,
              })
            }
          >
            Open containing folder
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Root>
      {item.expanded && item.children?.length === 0 && (
        <div
          css={[
            entryStyles,
            css`
              padding: 0;
              padding-right: var(--space-1);
              font-style: italic;
              color: var(--gray-10);
              pointer-events: none;
            `,
          ]}
          style={{ paddingLeft: (item.level + 2) * 16 }}
        >
          Directory is empty
        </div>
      )}
    </>
  )
}

interface FileEntryProps {
  entry: FileEntry
  item: TreeItem<FileTreeEntry>
  selected: boolean
  onRefreshDirectory: (path: string) => void | Promise<void>
}

function FileItem({
  entry,
  item,
  selected,
  onRefreshDirectory,
}: FileEntryProps) {
  const navigate = useNavigate()
  const [isRenaming, setIsRenaming] = useState(false)
  const [value, setValue] = useState(entry.basename)
  const inputRef = useRef<HTMLInputElement>(null)

  const parentPath = pathe.dirname(entry.path)

  const studioFile = entry.file ?? {
    type: inferFileTypeFromExtension(entry.path),
    path: entry.path,
    fileName: entry.basename,
    displayName: entry.basename,
  }

  const nameWithoutExtension = pathe.basename(
    entry.path,
    pathe.extname(entry.path)
  )

  const deleteFile = useDeleteFile({
    file: studioFile,
    navigateHomeOnDelete: selected,
  })

  const handleDelete = async () => {
    await deleteFile()
    await onRefreshDirectory(parentPath)
  }

  useEffect(() => {
    if (isRenaming) {
      inputRef.current?.focus()
      inputRef.current?.setSelectionRange(
        0,
        pathe.basename(entry.path, pathe.extname(entry.path)).length
      )
    }
  }, [isRenaming, entry])

  const handleRename = async () => {
    const trimmed = value.trim()

    if (trimmed === '' || trimmed === entry.basename) {
      setIsRenaming(false)
      setValue(entry.basename)

      return
    }

    try {
      await window.studio.ui.renameFile(entry.path, value)
      await onRefreshDirectory(parentPath)

      if (selected) {
        navigate(getViewPath(pathe.join(parentPath, value)), {
          replace: true,
        })
      }

      setIsRenaming(false)
    } catch (error) {
      console.error(error)
    }
  }

  if (isRenaming) {
    return (
      <div
        css={[
          entryStyles,
          css`
            padding-top: 0;
            padding-bottom: 0;
            overflow: visible;
          `,
        ]}
        style={{ paddingLeft: (item.level + 1) * 16 }}
      >
        <Flex align="center" gap="1" width="100%">
          <FileEntryIcon fileType={entry.file?.type} size={16} />
          <WorkspaceFileTreeInput
            value={value}
            selectionRange={[0, nameWithoutExtension.length]}
            onChange={setValue}
            onCommit={handleRename}
            onCancel={() => setIsRenaming(false)}
          />
        </Flex>
      </div>
    )
  }

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <Reset>
          <NavLink
            to={getViewPath(entry.path)}
            data-selected={selected}
            css={[
              entryStyles,
              css`
                &[data-focused='true'],
                &[data-selected='true'] {
                  color: var(--accent-9);
                }

                &[data-selected='true'] {
                  font-weight: 700;
                }
              `,
            ]}
            style={{ paddingLeft: (item.level + 1) * 16 }}
            onClick={() => item.toggle()}
            {...item.props.aria}
            {...item.props.control}
          >
            <FileEntryIcon fileType={entry.file?.type} size={16} />
            <span
              css={css`
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              `}
            >
              {entry.basename}
            </span>
          </NavLink>
        </Reset>
      </ContextMenu.Trigger>
      <ContextMenu.Content size="1">
        <ContextMenu.Item onSelect={() => setIsRenaming(true)}>
          Rename
        </ContextMenu.Item>
        <ContextMenu.Item
          onSelect={() => window.studio.ui.openContainingFolder(studioFile)}
        >
          Open containing folder
        </ContextMenu.Item>
        <DeleteFileDialog
          file={studioFile}
          onConfirm={handleDelete}
          trigger={
            <ContextMenu.Item color="red" onSelect={(e) => e.preventDefault()}>
              Delete
            </ContextMenu.Item>
          }
        />
      </ContextMenu.Content>
    </ContextMenu.Root>
  )
}

const newFileId = Symbol('new-file')

interface NewFileEntry {
  type: 'new-file'
  path: typeof newFileId
  hint: string
  dirname: string
  fileType: 'browser-test' | 'generator'
}

type FileTreeEntry = DirectoryEntry | NewFileEntry

const workspaceNameFuseOptions: IFuseOptions<{
  path: string
  basename: string
}> = {
  ignoreLocation: true,
  distance: 1,
  keys: ['basename'],
}

function isDescendantPath(descendantPath: string, ancestorPath: string) {
  if (descendantPath === ancestorPath) {
    return false
  }

  const prefix = ancestorPath.endsWith(pathe.sep)
    ? ancestorPath
    : `${ancestorPath}${pathe.sep}`

  return descendantPath.startsWith(prefix)
}

interface WorkspaceFileTreeProps {
  /** When non-empty, only entries matching this filter (loaded folders/files) are shown. */
  nameFilter?: string
}

export function WorkspaceFileTree({ nameFilter = '' }: WorkspaceFileTreeProps) {
  const navigate = useNavigate()

  const workspace = useWorkspace()
  const { path } = useParams<{ path: string }>()

  const [entries, setEntries] = useState<Record<string, FileTreeEntry[]>>({})

  function loadDirectory(path: string) {
    return window.studio.file.listDirectory({ path }).then((entries) => {
      setEntries((prev) => {
        return { ...prev, [path]: entries }
      })
    })
  }

  useEffect(() => {
    if (workspace?.path === undefined) {
      return
    }

    loadDirectory(workspace.path).catch((error) => {
      console.error(error)
    })
  }, [workspace?.path])

  const tree = useTree({
    root: {
      type: 'directory',
      basename: pathe.basename(workspace?.path ?? ''),
      path: workspace?.path ?? '',
    },

    nodes: entries,

    getId(item) {
      return item.path
    },

    isFolder(item) {
      return item.type === 'directory'
    },

    onExpand(item) {
      if (item.type !== 'directory') {
        return
      }

      return loadDirectory(item.path).catch((error) => {
        console.error(error)
      })
    },

    onCollapse(item) {
      if (item.type !== 'directory') {
        return
      }

      setEntries((prev) => {
        const { [item.path]: _, ...rest } = prev

        return rest
      })
    },
  })

  const handleStartCreateFile = (
    item: TreeItem<FileTreeEntry>,
    entry: NewFileEntry
  ) => {
    Promise.resolve(item.toggle(true))
      .then(() => {
        setEntries((prev) => {
          const entries = prev[entry.dirname] ?? []

          return { ...prev, [entry.dirname]: [...entries, entry] }
        })
      })
      .catch((error) => {
        console.error(error)
      })
  }

  const removeNewFileEntry = (entry: NewFileEntry) => {
    setEntries((prev) => {
      const entries = prev[entry.dirname] ?? []

      return {
        ...prev,
        [entry.dirname]: entries.filter((e) => e.type !== 'new-file'),
      }
    })
  }

  const handleCreateFile = ({
    entry,
    name,
    content,
  }: {
    entry: NewFileEntry
    name: string
    content: FileContent
  }) => {
    const location: FileOnDisk = {
      type: 'path',
      path: pathe.join(entry.dirname, name),
    }

    window.studio.file
      .save({ content, location })
      .then(() => loadDirectory(entry.dirname))
      .then(() => {
        navigate(getViewPath(location.path))
      })
      .catch((error) => {
        console.error(error)
      })

    removeNewFileEntry(entry)
  }

  const handleCancelCreateFile = (entry: NewFileEntry) => {
    removeNewFileEntry(entry)
  }

  const matchedPaths = useMemo(() => {
    if (nameFilter.match(/^\s*$/)) {
      return null
    }

    const q = nameFilter.trim()
    const searchable: { path: string; basename: string }[] = []

    for (const list of Object.values(entries)) {
      for (const e of list ?? []) {
        if (e.type === 'file' || e.type === 'directory') {
          searchable.push({ path: e.path, basename: e.basename })
        }
      }
    }

    if (searchable.length === 0) {
      return new Set<string>()
    }

    const fuse = new Fuse(searchable, workspaceNameFuseOptions)

    return new Set(fuse.search(q).map((r) => r.item.path))
  }, [entries, nameFilter])

  const visibleTreeItems = useMemo(() => {
    if (matchedPaths === null) {
      return tree.items
    }

    return tree.items.filter((treeItem) => {
      const node = treeItem.node

      if (node.type === 'new-file') {
        return true
      }

      if (node.type === 'file') {
        return matchedPaths.has(node.path)
      }

      if (matchedPaths.has(node.path)) {
        return true
      }

      for (const p of matchedPaths) {
        if (isDescendantPath(p, node.path)) {
          return true
        }
      }

      return false
    })
  }, [tree.items, matchedPaths])

  if (workspace === null) {
    return null
  }

  return (
    <Flex
      direction="column"
      aria-label="Workspace File Tree"
      overflow="hidden"
      {...tree.props}
    >
      {visibleTreeItems.map((item) => {
        if (item.node.type === 'directory') {
          return (
            <DirectoryItem
              key={item.node.path}
              entry={item.node}
              item={item}
              onNewFile={handleStartCreateFile}
              onRefreshDirectory={loadDirectory}
            />
          )
        }

        if (item.node.type === 'new-file') {
          return (
            <NewFileItem
              key={String(item.node.path)}
              item={item}
              entry={item.node}
              onCreate={handleCreateFile}
              onCancel={handleCancelCreateFile}
            />
          )
        }

        return (
          <FileItem
            key={item.node.path}
            entry={item.node}
            item={item}
            selected={path === item.node.path}
            onRefreshDirectory={loadDirectory}
          />
        )
      })}
    </Flex>
  )
}
