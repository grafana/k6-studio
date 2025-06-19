import { Box, Code, Inset, Text } from '@radix-ui/themes'

import { CodeSnippet } from '@/components/CodeSnippet'

const SNIPPET = `{
  "user": {
    "name": "John",
    "hobbies": ["hiking", "fishing", "jogging"]
  }
}`

export function JsonSelectorHint() {
  return (
    <Box>
      <Text size="1">
        Use dot and bracket notation to navigate JSON objects and extract
        values.
      </Text>
      <Inset>
        <Box
          css={{
            margin: 'var(--space-4) 0',
            borderTop: '1px solid var(--gray-3)',
            borderBottom: '1px solid var(--gray-3)',
          }}
        >
          <CodeSnippet value={SNIPPET} language="json" />
        </Box>
      </Inset>
      <Text as="p" size="1" mb="1">
        Dot path to access nested values: <Code>user.name</Code> {'->'}{' '}
        <Code>John</Code>
      </Text>
      <Text as="p" size="1" mb="1">
        Brackets to access nested values: <Code>{`["user"]["name"]`}</Code>{' '}
        {'->'} <Code>John</Code>
      </Text>

      <Text as="p" size="1">
        Brackets to access array elements: <Code>user.hobbies[1]</Code> {'->'}{' '}
        <Code>fishing</Code>
      </Text>
    </Box>
  )
}
