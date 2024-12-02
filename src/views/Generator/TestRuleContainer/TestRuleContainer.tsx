import { selectFilteredRequests, useGeneratorStore } from '@/store/generator'
import {
  Flex,
  Heading,
  Link,
  ScrollArea,
  Text,
  Tooltip,
} from '@radix-ui/themes'
import { NewRuleMenu } from '../NewRuleMenu'
import { SortableRuleList } from './SortableRuleList'
import { css } from '@emotion/react'
import { TestOptions } from '../TestOptions'
import grotIllustration from '@/assets/grot.svg'
import { Allowlist } from '../Allowlist'
import { correlate } from '@/correlation/correlateArchiveData'
import { proxyDataToHar } from '@/utils/proxyDataToHar'
import type { Har } from 'har-format'
import { MouseEvent, ReactNode, useMemo } from 'react'
import type { Patch, Selector } from '@/correlation/types'
import { ProxyData } from '@/types'
import { useSetAtom } from 'jotai'
import { selectedRequestAtom } from '../GeneratorSidebar/RequestList'

function truncateString(str: string, length: number) {
  if (str.length <= length) {
    return str
  }

  return str.slice(0, length) + '...'
}

function formatJsonPath(path: Array<string | number>) {
  return path.reduce((acc, part) => {
    if (typeof part === 'string') {
      return `${acc}.${part}`
    }

    return `${acc}[${part}]`
  }, '$')
}

function toFromText(selector: Selector): ReactNode {
  switch (selector.type) {
    case 'json':
      return <code>{formatJsonPath(selector.path)}</code>

    case 'css':
      return selector.rule

    case 'param':
      return `${selector.name}`

    default:
      return ''
  }
}

function toToText(patch: Patch) {
  switch (patch.type) {
    case 'path':
      return (
        <>
          <strong>
            <code>{patch.selector.value}</code>
          </strong>{' '}
          in path
        </>
      )

    case 'body':
      return (
        <>
          <strong>{toFromText(patch.selector)}</strong> in body
        </>
      )
  }
}

function RequestLink({ request }: { request: ProxyData }) {
  const setSelectedRequestId = useSetAtom(selectedRequestAtom)

  function handleClick(ev: MouseEvent<HTMLElement>) {
    ev.preventDefault()

    setSelectedRequestId(request.id)
  }

  const text = `${request.request.method} ${request.request.path}`

  return (
    <Tooltip content={text}>
      <Link href="#" onClick={handleClick}>
        {truncateString(text, 20)}
      </Link>
    </Tooltip>
  )
}

interface PatchProperties {
  requests: ProxyData[]
  patch: Patch
}

function Patch({ requests, patch }: PatchProperties) {
  const sourceRequest = requests[patch.from.target]
  const targetRequest = requests[patch.target]

  if (sourceRequest === undefined || targetRequest === undefined) {
    return null
  }

  return (
    <div
      css={css`
        font-size: 12px;
        padding: var(--space-2);
        background-color: var(--color-background);
        border-bottom: 1px solid var(--gray-3);

        &:first-of-type {
          border-top: 1px solid var(--gray-3);
        }
      `}
    >
      Replace {toToText(patch)} of <RequestLink request={targetRequest} /> with{' '}
      <strong>{toFromText(patch.from.variable.selector)}</strong> from{' '}
      <RequestLink request={sourceRequest} />
    </div>
  )
}

export function TestRuleContainer() {
  const rules = useGeneratorStore((store) => store.rules)
  const swapRules = useGeneratorStore((store) => store.swapRules)

  const filteredRequests = useGeneratorStore(selectFilteredRequests)

  const patches = useMemo(() => {
    if (!filteredRequests) {
      return []
    }

    return correlate(proxyDataToHar(filteredRequests) as Har)
  }, [filteredRequests])

  return (
    <ScrollArea scrollbars="vertical">
      <Flex
        position="sticky"
        align="center"
        top="0"
        pr="2"
        gap="2"
        css={css`
          background-color: var(--color-background);
          z-index: 1;
        `}
      >
        <Heading
          css={css`
            flex-grow: 1;
            font-size: 15px;
            line-height: 24px;
            font-weight: 500;
            padding: var(--space-2);
          `}
        >
          Test rules ({rules.length})
        </Heading>
        <Flex gap="3">
          <NewRuleMenu />
          <TestOptions />
          <Allowlist />
        </Flex>
      </Flex>

      <SortableRuleList rules={rules} onSwapRules={swapRules} />
      <Flex
        py="3"
        px="6"
        align={rules.length === 0 ? 'center' : 'start'}
        direction="column"
        gap="3"
      >
        {rules.length === 0 ? (
          <>
            <img
              src={grotIllustration}
              css={css`
                max-height: 200px;
              `}
            />
            <Text size="1" color="gray">
              Start configuring your test logic by adding a new rule
            </Text>
            <NewRuleMenu variant="solid" size="2" />
          </>
        ) : (
          <NewRuleMenu />
        )}
      </Flex>

      {patches.map((patch, index) => {
        return <Patch key={index} requests={filteredRequests} patch={patch} />
      })}
    </ScrollArea>
  )
}
