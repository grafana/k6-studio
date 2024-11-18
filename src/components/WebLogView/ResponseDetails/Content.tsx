import { useState } from 'react'
import {
  Box,
  Flex,
  ScrollArea,
  SegmentedControl,
  Switch,
  Text,
} from '@radix-ui/themes'

import { ProxyData } from '@/types'
import { getContentType } from '@/utils/headers'
import { Preview } from './Preview'
import { Raw } from './Raw'
import { parseContent, toFormat } from './ResponseDetails.utils'
import { Label } from '@/components/Label'
import { ReadOnlyEditor } from '@/components/Monaco/ReadOnlyEditor'
import { useEditorWordWrapSetting } from '@/hooks/useEditorWordWrapSetting'

export function Content({ data }: { data: ProxyData }) {
  const [selectedTab, setSelectedTab] = useState('preview')
  const { wordWrap, setWordWrap } = useEditorWordWrapSetting(
    'wordWrapResponseContent'
  )

  const contentType = getContentType(data.response?.headers ?? [])
  const format = toFormat(contentType)
  const content = parseContent(format, data)
  const rawFormat = format === 'json' ? 'json-raw' : format
  const rawContent = parseContent(rawFormat, data)

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

  return (
    <Flex direction="column" gap="4" height="100%" py="4">
      {!isMedia(format) && (
        <Flex gap="2" justify="between" px="4">
          <Label flexGrow="1">
            {selectedTab === 'content' && (
              <>
                <Text size="2">Word-wrap</Text>
                <Switch
                  size="1"
                  checked={wordWrap === 'on'}
                  onCheckedChange={setWordWrap}
                />
              </>
            )}{' '}
          </Label>
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
          {selectedTab === 'raw' && (
            <Raw content={rawContent ?? ''} format={format} />
          )}
          {selectedTab === 'content' && (
            <ReadOnlyEditor
              language={format}
              value={content}
              options={{ wordWrap }}
            />
          )}
        </Box>
      </ScrollArea>
    </Flex>
  )
}

const isMedia = (format: string) =>
  ['audio', 'font', 'image', 'video'].includes(format)
