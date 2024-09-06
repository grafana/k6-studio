import { useState } from 'react'
import { Box, Flex, ScrollArea, SegmentedControl } from '@radix-ui/themes'

import { ProxyData } from '@/types'
import { getContentType } from '@/utils/headers'
import { Preview } from './Preview'
import { Raw } from './Raw'
import { parseContent, toFormat } from './ResponseDetails.utils'
import { OriginalContent } from './OriginalContent'

export function Content({ data }: { data: ProxyData }) {
  const [selectedTab, setSelectedTab] = useState('preview')

  const contentType = getContentType(data.response?.headers ?? [])
  const format = toFormat(contentType)
  const content = parseContent(format, data)

  if (!contentType || !content || !format) {
    return (
      <Flex height="200px" justify="center" align="center">
        No Content
      </Flex>
    )
  }

  const contentProps = {
    content,
    contentType,
    format,
  }

  return (
    <Flex direction="column" gap="4" height="100%" py="4">
      {!isMedia(format) && (
        <Flex gap="2" justify="end" px="4">
          <SegmentedControl.Root
            defaultValue="preview"
            radius="small"
            size="1"
            variant="classic"
            onValueChange={(value) => setSelectedTab(value)}
          >
            <SegmentedControl.Item value="raw">Raw</SegmentedControl.Item>
            <SegmentedControl.Item value="content">
              Content
            </SegmentedControl.Item>
            <SegmentedControl.Item value="preview">
              Preview
            </SegmentedControl.Item>
          </SegmentedControl.Root>
        </Flex>
      )}
      <ScrollArea style={{ height: '100%' }}>
        <Box px="4" height="100%">
          {selectedTab === 'preview' && <Preview {...contentProps} />}
          {selectedTab === 'raw' && <Raw {...contentProps} />}
          {selectedTab === 'content' && <OriginalContent {...contentProps} />}
        </Box>
      </ScrollArea>
    </Flex>
  )
}

const isMedia = (format: string) =>
  ['audio', 'font', 'image', 'video'].includes(format)
