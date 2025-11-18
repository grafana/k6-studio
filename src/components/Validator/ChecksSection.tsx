import { css } from '@emotion/react'
import { Box, Callout, ScrollArea } from '@radix-ui/themes'
import { InfoIcon } from 'lucide-react'
import { useMemo } from 'react'

import { CollapsibleSection } from '@/components/CollapsibleSection'
import { Table } from '@/components/Table'
import { Check } from '@/schemas/k6'

import { CheckRow } from './CheckRow'
import { groupChecksByPath } from './ChecksSection.utils'

interface ChecksSectionProps {
  checks: Check[]
  isRunning: boolean
}

export function ChecksSection({ checks, isRunning }: ChecksSectionProps) {
  const nonEmptyGroupChecks = useMemo(
    () =>
      Object.entries(groupChecksByPath(checks)).filter(
        ([, checks]) => checks.length > 0
      ),
    [checks]
  )

  if (!checks.length || isRunning) {
    return <NoChecksMessage />
  }

  return (
    <ScrollArea scrollbars="vertical">
      <Box pb="2">
        {nonEmptyGroupChecks.map(([key, checks]) => (
          <CollapsibleSection
            content={
              <>
                <Table.Root
                  size="1"
                  variant="ghost"
                  css={css`
                    border-radius: 0;
                  `}
                >
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell align="right">
                        Success rate
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell align="right">
                        Success count
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell align="right">
                        Fail count
                      </Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                    {checks.map((check) => (
                      <CheckRow check={check} key={check.id} />
                    ))}
                  </Table.Body>
                </Table.Root>
              </>
            }
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
    </ScrollArea>
  )
}

function NoChecksMessage() {
  return (
    <Box p="2">
      <Callout.Root>
        <Callout.Icon>
          <InfoIcon />
        </Callout.Icon>
        <Callout.Text>Your checks will appear here.</Callout.Text>
      </Callout.Root>
    </Box>
  )
}
