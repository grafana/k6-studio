import { CollapsibleSection } from '@/components/CollapsibleSection'
import { K6Check } from '@/types'
import { css } from '@emotion/react'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import { Box, Callout } from '@radix-ui/themes'
import { groupChecksByPath } from './ChecksSection.utils'
import { CheckRow } from './CheckRow'

interface ChecksSectionProps {
  checks: K6Check[]
  isRunning: boolean
}

export function ChecksSection({ checks, isRunning }: ChecksSectionProps) {
  if (!checks.length || isRunning) {
    return <NoChecksMessage />
  }

  console.log(JSON.stringify(checks))
  const groupedChecks = groupChecksByPath(checks)

  return (
    <Box pb="2">
      {Object.entries(groupedChecks).map(([key, checks]) => (
        <CollapsibleSection
          content={checks.map((check) => (
            <CheckRow check={check} key={check.id} />
          ))}
          key={key}
          defaultOpen
        >
          <span
            css={css`
              font-size: 13px;
              font-weight: 500;
            `}
          >
            {key} ({checks.length})
          </span>
        </CollapsibleSection>
      ))}
    </Box>
  )
}

function NoChecksMessage() {
  return (
    <Box p="2">
      <Callout.Root>
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>Your checks will appear here.</Callout.Text>
      </Callout.Root>
    </Box>
  )
}
