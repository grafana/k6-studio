import { Box, Code, Flex, Text } from '@radix-ui/themes'
import { ReactNode } from 'react'
import Markdown, { Components } from 'react-markdown'

function Heading({ children }: { children?: ReactNode }) {
  return (
    <Text as="p" size="2" weight="bold">
      {children}
    </Text>
  )
}

const components: Components = {
  blockquote: ({ children }) => (
    <Box
      css={{
        borderLeft: '3px solid var(--orange-8)',
        backgroundColor: 'var(--orange-2)',
        borderRadius: '0 var(--radius-2) var(--radius-2) 0',
        padding: 'var(--space-2) var(--space-3)',
        marginTop: 'var(--space-1)',
        marginBottom: 'var(--space-1)',
      }}
    >
      {children}
    </Box>
  ),
  p: ({ children }) => (
    <Text as="p" size="2" mb="1">
      {children}
    </Text>
  ),
  strong: ({ children }) => <Text weight="bold">{children}</Text>,
  code: ({ children }) => <Code size="2">{children}</Code>,
  ul: ({ children }) => (
    <Text as="div" size="2" css={{ paddingLeft: 16 }}>
      {children}
    </Text>
  ),
  ol: ({ children }) => (
    <Text as="div" size="2" css={{ paddingLeft: 16 }}>
      {children}
    </Text>
  ),
  // Loose lists wrap item content in block paragraphs; the flex row keeps
  // the bullet and the content on the same line either way.
  li: ({ children }) => (
    <Flex gap="1" align="start">
      <Text size="2">-</Text>
      <Box css={{ minWidth: 0 }}>{children}</Box>
    </Flex>
  ),
  a: ({ children }) => <Text>{children}</Text>,
  h1: Heading,
  h2: Heading,
  h3: Heading,
}

export function SimpleMarkdown({ text }: { text: string }) {
  return <Markdown components={components}>{text}</Markdown>
}
