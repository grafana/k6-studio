import { useState } from 'react'
import { Box, Flex, ScrollArea, Switch, Text } from '@radix-ui/themes'

import { ProxyData } from '@/types'
import { getContentType } from '@/utils/headers'
import { Preview } from './Preview'
import { Raw } from './Raw'
import { parseContent, toFormat } from './ResponseDetails.utils'

export function Content({ data }: { data: ProxyData }) {
  const [isPreview, setIsPreview] = useState(true)

  const contentType = getContentType(data.response?.headers ?? [])
  const format = toFormat(contentType)
  const content = parseContent(format, data)

  if (!contentType || !content || !format) {
    return (
      <Flex height="200px" justify="center" align="center">
        Content not available
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
      <Text as="label" size="2">
        <Flex gap="2" justify="end" px="4">
          <Switch
            defaultChecked
            size="1"
            variant="surface"
            onClick={() => setIsPreview(!isPreview)}
          />
          Preview
        </Flex>
      </Text>
      <ScrollArea style={{ height: '100%' }}>
        <Box px="4" height="100%">
          {isPreview ? (
            <Preview {...contentProps} />
          ) : (
            <Raw {...contentProps} />
          )}
        </Box>
      </ScrollArea>
    </Flex>
  )
}
