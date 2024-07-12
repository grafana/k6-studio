import { useGeneratorStore } from '@/hooks/useGeneratorStore'
import { Flex } from '@radix-ui/themes'
import { TestRuleItem } from './TestRule'
import { NewRuleMenu } from '../NewRuleMenu'

export function TestRuleContainer() {
  const { rules } = useGeneratorStore()

  return (
    <Flex
      direction="column"
      gap="1"
      height="100%"
      p="2"
      // TODO: check if scrollbars looks the same across platforms and either
      // remove or replace ScrollArea with native scrollbars
      style={{ overflowY: 'auto', paddingTop: '0 ' }}
    >
      <Flex
        position="sticky"
        align="center"
        justify="between"
        top="0"
        py="2"
        style={{ background: 'var(--color-background)' }}
      >
        Test rules ({rules.length})<NewRuleMenu />
      </Flex>

      {rules.map((rule, i) => (
        <TestRuleItem rule={rule} key={i} />
      ))}
    </Flex>
  )
}
