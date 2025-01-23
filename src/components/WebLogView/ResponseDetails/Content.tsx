import { useEffect, useState } from 'react'
import { Box, Flex, ScrollArea, SegmentedControl } from '@radix-ui/themes'

import { ProxyData } from '@/types'
import { getContentType } from '@/utils/headers'
import { Preview } from './Preview'
import { Raw } from './Raw'
import { parseContent, toFormat } from './ResponseDetails.utils'
import { ReadOnlyEditor } from '@/components/Monaco/ReadOnlyEditor'
import { useGoToContentMatch } from '../Details.hooks'

export function Content({ data }: { data: ProxyData }) {
  const [selectedTab, setSelectedTab] = useState('content')
  const { searchString, index, reset } = useGoToContentMatch()

  const contentType = getContentType(data.response?.headers ?? [])
  const format = toFormat(contentType)
  const content = parseContent(format, data)
  const rawFormat = format === 'json' ? 'json-raw' : format
  const rawContent = parseContent(rawFormat, data)

  // Reset search string on unmount
  useEffect(() => {
    return reset
  }, [reset])

  useEffect(() => {
    setSelectedTab('content')
  }, [format])

  if (!contentType || !content || !format) {
    return (
      <Flex height="200px" justify="center" align="center">
        No content
      </Flex>
    )
  }

  const contentProps = {
    content,
    contentType,
    format,
  }

  if (isMedia(format)) {
    return (
      <Box height="100%">
        <Preview {...contentProps} />
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
        </SegmentedControl.Root>
      </Flex>
      <Box flexGrow="1">
        <ScrollArea>
          <Box px="2" height="100%">
            {selectedTab === 'preview' && <Preview {...contentProps} />}
            {selectedTab === 'raw' && (
              <Raw
                content={rawContent ?? ''}
                format={format}
                searchString={searchString}
                searchIndex={index}
              />
            )}
            {selectedTab === 'content' && (
              <ReadOnlyEditor
                language={format}
                value={content}
                searchString={searchString}
                searchIndex={index}
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
