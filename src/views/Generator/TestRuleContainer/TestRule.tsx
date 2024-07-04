import type { TestRule } from '@/types/rules'
import { exhaustive } from '@/utils/typescript'
import { Box, Code, Flex } from '@radix-ui/themes'

interface TestRuleItemProps {
  rule: TestRule
}

export function TestRuleItem({ rule }: TestRuleItemProps) {
  return (
    <Flex
      gap="3"
      align="center"
      p="1"
      style={{
        borderRadius: 'var(--radius-1)',
        backgroundColor: 'var(--gray-4)',
      }}
    >
      <TestRuleType rule={rule} />
      {rule.type === 'customCode' && (
        <>
          {rule.placement} all requests <Code>{rule.snippet}</Code>
        </>
      )}
      {rule.type === 'correlation' && (
        <>
          {rule.extractor.filter.path} all requests <Code>{rule.extractor.selector.type}</Code>
        </>
      )}
    </Flex>
  )
}

function TestRuleType({ rule }: TestRuleItemProps) {
  function getLabel(rule: TestRule) {
    switch (rule.type) {
      case 'customCode':
        return 'Custom code'
      case 'correlation':
        return 'Correlation'
      case 'parameterization':
        return 'Response'
      case 'verification':
        return 'Verification'
      default:
        return exhaustive(rule)
    }
  }

  return (
    <Box
      px="2"
      py="1"
      style={{
        display: 'inline-block',
        backgroundColor: 'var(--violet-7)',
        borderRadius: 'var(--radius-1)',
      }}
    >
      {getLabel(rule)}
    </Box>
  )
}
