import { Button, Flex } from '@radix-ui/themes'

import TextSpinner from '@/components/TextSpinner/TextSpinner'

interface FooterActionsProps {
  isLoading: boolean
  ruleCount: number
  onStop: () => void
  onDiscard: () => void
  onAccept: () => void
}

export function FooterActions({
  isLoading,
  ruleCount,
  onStop,
  onDiscard,
  onAccept,
}: FooterActionsProps) {
  if (isLoading) {
    return (
      <Flex gap="3" align="center">
        <TextSpinner text="Correlating…" color="gray" />
        <Button variant="outline" onClick={onStop} size="2" color="red">
          Stop
        </Button>
      </Flex>
    )
  }

  return (
    <Flex gap="3">
      <Button variant="outline" onClick={onDiscard} size="2">
        Discard
      </Button>
      <Button onClick={onAccept} disabled={ruleCount === 0} size="2">
        Add {ruleCount} {ruleCount === 1 ? 'rule' : 'rules'}
      </Button>
    </Flex>
  )
}
