import { css } from '@emotion/react'
import {
  DropdownMenu,
  Flex,
  IconButton,
  Reset,
  Tooltip,
} from '@radix-ui/themes'
import {
  FileArchiveIcon,
  FileBoxIcon,
  FileCodeIcon,
  FileCogIcon,
  FileIcon,
  FolderClosedIcon,
  FolderOpenIcon,
  LucideProps,
  PlusIcon,
} from 'lucide-react'
import * as pathe from 'pathe'
import { KeyboardEvent, useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate, useParams } from 'react-router-dom'

import { useWorkspace } from '@/contexts/WorkspaceContext'
import type {
  DirectoryEntry,
  FileContent,
  FileEntry,
  FileOnDisk,
  SubDirectoryEntry,
} from '@/handlers/file/types'
import { useFeaturesStore } from '@/store/features'
import { FileType } from '@/types'
import { getViewPath, inferFileTypeFromExtension } from '@/utils/file'
import { createNewGeneratorFile } from '@/utils/generator'

import { TreeItem, useTree } from './WorkspaceFileTree.hooks'

const entryStyles = css`
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1);

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
  const isInitializedRef = useRef(false)

  const [value, setValue] = useState(entry.hint)

  const inferredFileType = inferFileTypeFromExtension(value)

  const handleCreate = () => {
    const content = createContentForType(inferredFileType)

    if (content === null) {
      return
    }

    onCreate({ entry, name: value, content })
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()

      onCancel(entry)

      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()

      handleCreate()

      return
    }
  }

  const handleBlur = () => {
    if (value.trim() === '') {
      onCancel(entry)
      return
    }
    handleCreate()
  }

  const handleMount = (el: HTMLInputElement | null) => {
    if (el === null || isInitializedRef.current) {
      return
    }

    const nameWithoutExtension = pathe.basename(
      entry.hint,
      pathe.extname(entry.hint)
    )

    el.setSelectionRange(0, nameWithoutExtension.length)
    el.focus()

    isInitializedRef.current = true
  }

  return (
    <div css={entryStyles} style={{ paddingLeft: `${item.level * 16}px` }}>
      <Flex align="center" gap="1" width="100%">
        <FileEntryIcon fileType={inferredFileType} size={16} />
        <input
          ref={handleMount}
          type="text"
          css={css`
            font-size: 12px;
            padding: var(--space-1) var(--space-2) var(--space-1) 0;
            color: var(--gray-11);
            font-weight: 400;
            background: var(--gray-3);
            border: none;
            flex: 1 1 0;
          `}
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
          }}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
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
}

function DirectoryItem({ entry, item, onNewFile }: DirectoryEntryProps) {
  return (
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
          style={{ paddingLeft: item.level * 16 }}
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
              type === 'browser-test' ? 'browser-test.k6b' : 'generator.k6g',
            dirname: entry.path,
            fileType: type,
          })
        }}
      />
    </div>
  )
}

interface FileEntryProps {
  entry: FileEntry
  item: TreeItem<FileTreeEntry>
  selected: boolean
}

function FileItem({ entry, item, selected }: FileEntryProps) {
  return (
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
        style={{ paddingLeft: item.level * 16 }}
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
  )
}

interface ItemIconProps extends LucideProps {
  fileType: FileType | undefined
}

function FileEntryIcon({ fileType, ...props }: ItemIconProps) {
  switch (fileType) {
    case 'script':
      return <FileCodeIcon {...props} />

    case 'recording':
      return <FileArchiveIcon {...props} />

    case 'browser-test':
    case 'generator':
      return <FileCogIcon {...props} />

    case 'json':
    case 'csv':
      return <FileBoxIcon {...props} />

    default:
      return <FileIcon {...props} />
  }
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

export function WorkspaceFileTree() {
  const navigate = useNavigate()

  const { workspacePath } = useWorkspace()
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
    if (workspacePath === null) {
      return
    }

    loadDirectory(workspacePath).catch((error) => {
      console.error(error)
    })
  }, [workspacePath])

  const tree = useTree({
    root: {
      type: 'directory',
      basename: 'Workspace',
      path: workspacePath ?? '',
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

  if (!workspacePath) {
    return null
  }

  return (
    <Flex
      direction="column"
      aria-label="Workspace File Tree"
      overflow="hidden"
      {...tree.props}
    >
      {tree.items.map((item) => {
        if (item.node.type === 'directory') {
          return (
            <DirectoryItem
              key={item.node.path}
              entry={item.node}
              item={item}
              onNewFile={handleStartCreateFile}
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
          />
        )
      })}
    </Flex>
  )
}
