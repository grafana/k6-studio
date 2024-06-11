import { Box, Text } from '@radix-ui/themes'
import { CollapsibleSection } from '../CollapsibleSection'

export function Group({
  name,
  children,
}: {
  name: string
  children: React.ReactNode
}) {
  return (
    <Box pb="2">
      <CollapsibleSection content={<Box>{children}</Box>} defaultOpen>
        <Text weight="bold" size="4">
          {name}
        </Text>
      </CollapsibleSection>
    </Box>
  )
}
