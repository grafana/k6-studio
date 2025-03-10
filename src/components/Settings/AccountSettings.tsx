import { css } from '@emotion/react'
import { ExternalLinkIcon, PlusIcon, TrashIcon } from '@radix-ui/react-icons'
import { Flex, Heading, IconButton, Table } from '@radix-ui/themes'
import { GrafanaIcon } from '../icons/GrafanaIcon'

const examples = [
  {
    stack: 'johan.grafana.net',
  },
  {
    stack: 'edgar.grafana.net',
  },
  {
    stack: 'uladzimir.grafana.net',
  },
  {
    stack: 'cristiano.grafana.net',
  },
]

export function AccountSettings() {
  return (
    <Flex direction="column" py="4">
      <Flex align="center" justify="between" p="2">
        <Heading
          size="2"
          css={css`
            display: flex;
            align-items: center;
            gap: var(--space-1);
          `}
        >
          <GrafanaIcon /> Grafana Cloud
        </Heading>
        <IconButton
          css={css`
            margin: 0;
          `}
          variant="ghost"
          size="1"
          m="0"
        >
          <PlusIcon />
        </IconButton>
      </Flex>
      <Table.Root>
        <Table.Body>
          {examples.map((example) => {
            return (
              <Table.Row key={example.stack} align="center">
                <Table.Cell
                  css={css`
                    width: 100%;
                  `}
                >
                  {example.stack}
                </Table.Cell>
                <Table.Cell justify="end">
                  <Flex align="center" gap="3">
                    <IconButton variant="ghost">
                      <ExternalLinkIcon />
                    </IconButton>
                    <IconButton variant="ghost">
                      <TrashIcon color="red" />
                    </IconButton>
                  </Flex>
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table.Root>
    </Flex>
  )
}
