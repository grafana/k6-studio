import { css } from '@emotion/react'
import {
  asyncDataLoaderFeature,
  hotkeysCoreFeature,
  selectionFeature,
} from '@headless-tree/core'
import { useTree } from '@headless-tree/react'
import {
  FileArchiveIcon,
  FileBoxIcon,
  FileCodeIcon,
  FileCogIcon,
  FileIcon,
  FolderIcon,
  LucideProps,
} from 'lucide-react'
import * as pathe from 'pathe'
import { useNavigate } from 'react-router-dom'

import { useWorkspace } from '@/contexts/WorkspaceContext'
import type { DirectoryEntry } from '@/handlers/file/types'
import { useCurrentPath } from '@/hooks/useFileNameParam'
import { getViewPath } from '@/utils/file'

interface ItemIconProps extends LucideProps {
  item: DirectoryEntry
}

function ItemIcon({ item, ...props }: ItemIconProps) {
  if (item.type === 'directory') {
    return <FolderIcon {...props} />
  }

  if (item.file === null) {
    return <FileIcon {...props} />
  }

  switch (item.file.type) {
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

const loadingPlaceholder: DirectoryEntry = {
  type: 'file',
  basename: 'Loading...',
  path: '',
  file: null,
}

export function WorkspaceFileTree() {
  const { workspacePath } = useWorkspace()

  const currentPath = useCurrentPath()
  const navigate = useNavigate()

  const tree = useTree<DirectoryEntry>({
    rootItemId: workspacePath ?? '',
    getItemName: (item) => item.getItemData().basename,
    isItemFolder: (item) => item.getItemData().type === 'directory',
    indent: 16,
    createLoadingItemData: () => loadingPlaceholder,
    dataLoader: {
      getItem: async (itemId) => {
        if (itemId === workspacePath) {
          return {
            type: 'directory',
            basename: pathe.basename(workspacePath ?? '') || 'Workspace',
            path: workspacePath ?? '',
          }
        }

        const parentPath = pathe.dirname(itemId)

        const entries = await window.studio.file.listDirectory({
          path: parentPath,
        })

        return entries.find((e) => e.path === itemId) ?? loadingPlaceholder
      },
      getChildrenWithData: async (itemId) => {
        const entries = await window.studio.file.listDirectory({ path: itemId })

        return entries.map((entry) => {
          return { id: entry.path, data: entry }
        })
      },
    },
    onPrimaryAction: (item) => {
      const data = item.getItemData()

      if (data.type === 'file' && data.file) {
        navigate(getViewPath(data.file.type, data.file.path))
      }
    },
    features: [asyncDataLoaderFeature, selectionFeature, hotkeysCoreFeature],
  })

  if (!workspacePath) {
    return null
  }

  return (
    <div {...tree.getContainerProps()}>
      {tree.getItems().map((item) => {
        const data = item.getItemData()

        return (
          <button
            {...item.getProps()}
            key={item.getId()}
            type="button"
            data-active={item.getId() === currentPath}
            css={css`
              display: flex;
              align-items: center;
              gap: var(--space-2);
              width: 100%;
              padding: var(--space-1);
              padding-left: calc(
                var(--space-4) + ${item.getItemMeta().level * 16}px
              );
              font-size: 12px;
              text-align: left;
              background: none;
              border: none;
              cursor: pointer;
              color: var(--gray-11);

              &:hover {
                background-color: var(--gray-4);
              }

              &[data-active='true'] {
                color: var(--accent-9);
                font-weight: 700;
              }

              &:focus-visible {
                outline: 2px solid var(--focus-8);
                outline-offset: -1px;
              }
            `}
          >
            <ItemIcon
              item={data}
              size={16}
              css={css`
                flex-shrink: 0;
                color: currentColor;
              `}
            />
            <span
              css={css`
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              `}
            >
              {item.getItemName()}
              {item.isLoading() && ' (loading...)'}
            </span>
          </button>
        )
      })}
    </div>
  )
}
