import { css } from '@emotion/react'
import * as Collapsible from '@radix-ui/react-collapsible'
import { Flex, Reset, Text } from '@radix-ui/themes'
import { ChevronDownIcon, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import { File } from './File'
import { FileItem } from './types'

interface ValidatorRunsFileTreeProps {
  files: FileItem[]
  noFilesMessage?: string
}

/** Top-level `.har` files without a folder path */
const SOURCE_ROOT = 'Root'
/** Older layout: `<YYYY-MM-DD>/<*.har>` (no generator folder) */
const SOURCE_OLDER_LAYOUT = 'Older layout'

const DAY_FOLDER_RE = /^\d{4}-\d{2}-\d{2}$/

/** Pseudo-key for runs stored directly under the source folder (no date segment). */
const DATE_DIRECT = '__direct__'

function buildSourceDateTree(
  files: FileItem[]
): Map<string, Map<string, FileItem[]>> {
  const tree = new Map<string, Map<string, FileItem[]>>()

  function add(source: string, dateKey: string, file: FileItem) {
    if (!tree.has(source)) {
      tree.set(source, new Map())
    }
    const inner = tree.get(source)!
    if (!inner.has(dateKey)) {
      inner.set(dateKey, [])
    }
    inner.get(dateKey)!.push(file)
  }

  for (const file of files) {
    const parts = file.fileName.split('/').filter(Boolean)

    if (parts.length === 1) {
      add(SOURCE_ROOT, DATE_DIRECT, file)
    } else if (parts.length === 2) {
      const source = parts[0]!
      if (DAY_FOLDER_RE.test(source)) {
        add(SOURCE_OLDER_LAYOUT, source, file)
      } else {
        add(source, DATE_DIRECT, file)
      }
    } else if (parts.length >= 3) {
      add(parts[0]!, parts[1]!, file)
    }
  }

  for (const inner of tree.values()) {
    for (const list of inner.values()) {
      list.sort((a, b) => a.displayName.localeCompare(b.displayName))
    }
  }

  return tree
}

function sortSourceKeys(keys: string[]): string[] {
  const specials = new Set([SOURCE_ROOT, SOURCE_OLDER_LAYOUT])
  const normal = keys
    .filter((k) => !specials.has(k))
    .sort((a, b) => a.localeCompare(b))
  const older = keys.includes(SOURCE_OLDER_LAYOUT) ? [SOURCE_OLDER_LAYOUT] : []
  const root = keys.includes(SOURCE_ROOT) ? [SOURCE_ROOT] : []
  return [...normal, ...older, ...root]
}

function sortDateKeys(keys: string[]): string[] {
  const dated = keys
    .filter((k) => DAY_FOLDER_RE.test(k))
    .sort((a, b) => b.localeCompare(a))
  const undated = keys.filter((k) => !DAY_FOLDER_RE.test(k)).sort()
  return [...dated, ...undated]
}

export function ValidatorRunsFileTree({
  files,
  noFilesMessage = 'No validator runs yet',
}: ValidatorRunsFileTreeProps) {
  const [sectionOpen, setSectionOpen] = useState(true)
  const { fileName: currentFile } = useParams()

  const tree = useMemo(() => buildSourceDateTree(files), [files])
  const sourceKeys = useMemo(() => sortSourceKeys([...tree.keys()]), [tree])

  return (
    <Collapsible.Root open={sectionOpen} onOpenChange={setSectionOpen}>
      <Flex align="center" gap="2" width="100%" px="1" pt="1">
        <Collapsible.Trigger asChild>
          <Reset>
            <button type="button">
              <Flex align="center" gap="1">
                {sectionOpen ? <ChevronDownIcon /> : <ChevronRight />}
                <Text
                  size="2"
                  css={css`
                    flex-grow: 1;
                    font-weight: 600;
                    font-size: 12px;
                    text-transform: uppercase;
                  `}
                >
                  Validator runs ({files.length})
                </Text>
              </Flex>
            </button>
          </Reset>
        </Collapsible.Trigger>
      </Flex>
      <Collapsible.Content>
        {files.length === 0 ? (
          <span
            css={css`
              display: block;
              padding: var(--space-1) var(--space-2) var(--space-1)
                var(--space-5);
              font-size: 12px;
              line-height: 22px;
              color: var(--gray-11);
            `}
          >
            {noFilesMessage}
          </span>
        ) : (
          <ul
            css={css`
              list-style: none;
              padding: 0;
              margin: var(--space-1) 0 0;
            `}
          >
            {sourceKeys.map((sourceKey) => (
              <SourceGroup
                key={sourceKey}
                title={sourceKey}
                dates={tree.get(sourceKey)!}
                currentFile={currentFile}
              />
            ))}
          </ul>
        )}
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

interface SourceGroupProps {
  title: string
  dates: Map<string, FileItem[]>
  currentFile: string | undefined
}

function SourceGroup({ title, dates, currentFile }: SourceGroupProps) {
  const [open, setOpen] = useState(true)
  const dateKeys = sortDateKeys([...dates.keys()])
  const total = [...dates.values()].reduce((n, list) => n + list.length, 0)

  return (
    <li
      css={css`
        list-style: none;
      `}
    >
      <Collapsible.Root open={open} onOpenChange={setOpen}>
        <Collapsible.Trigger asChild>
          <Reset>
            <button
              type="button"
              css={css`
                display: flex;
                align-items: center;
                gap: var(--space-1);
                width: 100%;
                padding: var(--space-1) var(--space-2);
                padding-left: var(--space-3);
                font-size: 11px;
                font-weight: 600;
                color: var(--gray-10);
                text-transform: none;
                background: transparent;
                border: none;
                cursor: pointer;
                border-radius: 4px;

                &:hover {
                  background-color: var(--gray-4);
                }
              `}
            >
              {open ? (
                <ChevronDownIcon size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
              <span
                css={css`
                  flex: 1 1 0;
                  text-align: left;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                `}
              >
                {title}
              </span>
              <span
                css={css`
                  color: var(--gray-9);
                  font-weight: 400;
                `}
              >
                ({total})
              </span>
            </button>
          </Reset>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <ul
            css={css`
              list-style: none;
              padding: 0;
              margin: 0;
            `}
          >
            {dateKeys.map((dateKey) => {
              const list = dates.get(dateKey) ?? []
              if (dateKey === DATE_DIRECT) {
                return (
                  <li key={`${title}-${dateKey}`}>
                    <FileRowList
                      files={list}
                      currentFile={currentFile}
                      indent
                    />
                  </li>
                )
              }
              return (
                <li key={`${title}-${dateKey}`}>
                  <DateSubGroup
                    label={dateKey}
                    files={list}
                    currentFile={currentFile}
                  />
                </li>
              )
            })}
          </ul>
        </Collapsible.Content>
      </Collapsible.Root>
    </li>
  )
}

interface DateSubGroupProps {
  label: string
  files: FileItem[]
  currentFile: string | undefined
}

function DateSubGroup({ label, files, currentFile }: DateSubGroupProps) {
  const [open, setOpen] = useState(true)

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger asChild>
        <Reset>
          <button
            type="button"
            css={css`
              display: flex;
              align-items: center;
              gap: var(--space-1);
              width: 100%;
              padding: var(--space-1) var(--space-2);
              padding-left: var(--space-5);
              font-size: 11px;
              font-weight: 600;
              color: var(--gray-10);
              text-transform: none;
              background: transparent;
              border: none;
              cursor: pointer;
              border-radius: 4px;

              &:hover {
                background-color: var(--gray-4);
              }
            `}
          >
            {open ? <ChevronDownIcon size={14} /> : <ChevronRight size={14} />}
            <span
              css={css`
                flex: 1 1 0;
                text-align: left;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              `}
            >
              {label}
            </span>
            <span
              css={css`
                color: var(--gray-9);
                font-weight: 400;
              `}
            >
              ({files.length})
            </span>
          </button>
        </Reset>
      </Collapsible.Trigger>
      <Collapsible.Content>
        <FileRowList files={files} currentFile={currentFile} nested />
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

function FileRowList({
  files,
  currentFile,
  indent,
  nested,
}: {
  files: FileItem[]
  currentFile: string | undefined
  indent?: boolean
  nested?: boolean
}) {
  const pad =
    nested === true
      ? 'var(--space-7)'
      : indent === true
        ? 'var(--space-5)'
        : 'var(--space-3)'

  return (
    <ul
      css={css`
        list-style: none;
        padding: 0;
        margin: 0;
      `}
    >
      {files.map((file) => (
        <li key={file.fileName}>
          <div
            css={css`
              padding-left: ${pad};
            `}
          >
            <File file={file} isSelected={file.fileName === currentFile} />
          </div>
        </li>
      ))}
    </ul>
  )
}
