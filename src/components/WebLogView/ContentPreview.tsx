import { Flex, SegmentedControl, Box, ScrollArea } from '@radix-ui/themes'
import { useState } from 'react'

import { DiffEditor } from '../Monaco/DiffEditor'
import { ReadOnlyEditor } from '../Monaco/ReadOnlyEditor'

import { Preview } from './ResponseDetails/Preview'
import { Raw } from './ResponseDetails/Raw'

type ContentPreviewProps = {
  content: string
  contentType: string
  format: string
  rawContent: string | undefined
  searchIndex: number
  searchString?: string
  originalContent?: string
}

export function ContentPreview({
  format,
  content,
  rawContent,
  contentType,
  searchIndex,
  searchString,
  originalContent,
}: ContentPreviewProps) {
  function getInitialTab() {
    if (originalContent && originalContent !== content && !searchString) {
      return 'diff'
    }

    return 'content'
  }

  const [selectedTab, setSelectedTab] = useState(getInitialTab)

  if (isMedia(format)) {
    return (
      <Box height="100%">
        <Preview format={format} content={content} contentType={contentType} />
      </Box>
    )
  }

  return (
    <Flex direction="column" gap="2" height="100%">
      <Flex gap="2" justify="end" px="2">
        <SegmentedControl.Root
          value={selectedTab}
          radius="small"
          size="1"
          variant="classic"
          onValueChange={(value) => setSelectedTab(value)}
        >
          {isRawAvailable(contentType) && (
            <SegmentedControl.Item value="raw">Raw</SegmentedControl.Item>
          )}
          <SegmentedControl.Item value="content">Content</SegmentedControl.Item>
          {isPreviewable(format, contentType) && (
            <SegmentedControl.Item value="preview">
              Preview
            </SegmentedControl.Item>
          )}

          {originalContent !== undefined && originalContent !== content && (
            <SegmentedControl.Item value="diff">Diff</SegmentedControl.Item>
          )}
        </SegmentedControl.Root>
      </Flex>
      <Box flexGrow="1">
        <ScrollArea>
          <Box px="2" height="100%">
            {selectedTab === 'preview' && (
              <Preview
                format={format}
                content={content}
                contentType={contentType}
              />
            )}
            {selectedTab === 'raw' && (
              <Raw
                content={rawContent ?? ''}
                format={format}
                searchString={searchString}
                searchIndex={searchIndex}
              />
            )}
            {selectedTab === 'content' && (
              <ReadOnlyEditor
                language={format}
                value={content}
                searchString={searchString}
                searchIndex={searchIndex}
              />
            )}
            {selectedTab === 'diff' && (
              <DiffEditor
                language={format}
                value={content}
                original={originalContent}
                showToolbar
              />
            )}
          </Box>
        </ScrollArea>
      </Box>
    </Flex>
  )
}

const isMedia = (format: string) =>
  ['audio', 'font', 'image', 'video'].includes(format)

const isPreviewable = (format: string, contentType: string) =>
  !['javascript', 'css'].includes(format) &&
  contentType !== 'multipart/form-data'

const isRawAvailable = (contentType: string) =>
  contentType === 'application/json'
