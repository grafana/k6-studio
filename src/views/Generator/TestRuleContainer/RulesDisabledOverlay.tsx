import { useGeneratorStore } from '@/store/generator'
import { Flex, Text } from '@radix-ui/themes'
import { useTheme } from '@/hooks/useTheme'

export function RulesDisabledOverlay() {
  const theme = useTheme()
  const rulesEnabled = useGeneratorStore((store) => store.rulesEnabled)
  if (rulesEnabled) return null

  return (
    <Flex
      align="center"
      justify="center"
      css={{
        background: `var(--${theme === 'dark' ? 'black' : 'white'}-a9)`,
        inset: 0,
        position: 'absolute',
        zIndex: 2,
      }}
    >
      <Text size="6" color="gray">
        Rules are disabled
      </Text>
    </Flex>
  )
}
