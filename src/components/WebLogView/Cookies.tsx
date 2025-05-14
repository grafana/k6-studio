import { DataList, Flex } from '@radix-ui/themes'

import { Cookie } from '@/types'
import { Match } from '@/types/fuse'

import { HighlightedText } from '../HighlightedText'

export function Cookies({
  cookies = [],
  matches,
}: {
  cookies?: Cookie[]
  matches?: Match[]
}) {
  if (!cookies.length) {
    return (
      <Flex height="200px" justify="center" align="center">
        No cookies
      </Flex>
    )
  }

  return (
    <DataList.Root size="1" trim="both">
      {cookies.map(([name, value]) => (
        <DataList.Item key={name}>
          <DataList.Label>
            <HighlightedText
              text={name}
              matches={matches}
              highlightAllMatches
            />
          </DataList.Label>
          <DataList.Value>
            <HighlightedText
              text={value}
              matches={matches}
              highlightAllMatches
            />
          </DataList.Value>
        </DataList.Item>
      ))}
    </DataList.Root>
  )
}
