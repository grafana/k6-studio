import { Flex, SegmentedControl, Box, ScrollArea } from '@radix-ui/themes'
import { useState, useEffect } from 'react'

import { useApplyRules } from '@/store/hooks/useApplyRules'

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
  const [selectedTab, setSelectedTab] = useState('content')

  useEffect(() => {
    setSelectedTab('content')
  }, [format])

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
          <SegmentedControl.Item value="raw">Raw</SegmentedControl.Item>
          <SegmentedControl.Item value="content">Content</SegmentedControl.Item>
          {isPreviewable(format) && (
            <SegmentedControl.Item value="preview">
              Preview
            </SegmentedControl.Item>
          )}

          <SegmentedControl.Item value="diff">Diff</SegmentedControl.Item>
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
                // searchString={searchString}
                // searchIndex={searchIndex}
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

const isPreviewable = (format: string) =>
  !['javascript', 'css'].includes(format)
