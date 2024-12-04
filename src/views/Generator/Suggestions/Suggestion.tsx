import { GroupedCorrelation } from '@/correlation'
import { Correlatable } from '@/correlation/correlation'
import type {
  ExtractedValue,
  Selector,
  Patch as Suggestion,
} from '@/correlation/types'
import { ProxyData } from '@/types'
import { exhaustive } from '@/utils/typescript'
import { css } from '@emotion/react'
import * as Accordion from '@radix-ui/react-accordion'
import { ChevronRightIcon } from '@radix-ui/react-icons'
import { Flex, Reset, Tooltip } from '@radix-ui/themes'
import { ArrowLeftRight } from 'lucide-react'
import { ReactNode } from 'react'
import { RequestLink } from './RequestLink'

function formatJsonPath(path: Array<string | number>) {
  return path.reduce((acc, part) => {
    if (typeof part === 'string') {
      return `${acc}.${part}`
    }

    return `${acc}[${part}]`
  }, '$')
}

function formatSelector(selector: Selector): ReactNode {
  switch (selector.type) {
    case 'json':
      return <code>{formatJsonPath(selector.path)}</code>

    default:
      return <>Formatter for {selector.type} not implemented</>
  }
}

function formatExtractedValue(value: ExtractedValue): ReactNode {
  return <code>{JSON.stringify(value.value)}</code>
}

interface SelectorUsageProps {
  selector: Selector
}

function SelectorUsage({ selector }: SelectorUsageProps) {
  switch (selector.type) {
    case 'json':
      return (
        <>
          Used at{' '}
          <strong>
            <code>{formatJsonPath(selector.path)}</code>
          </strong>{' '}
          in JSON body
        </>
      )

    case 'path':
      return (
        <>
          Used in{' '}
          <strong>
            <code>path</code>
          </strong>
        </>
      )

    case 'header':
      return (
        <>
          Used by the{' '}
          <strong>
            <code>{selector.param}</code>
          </strong>{' '}
          header
        </>
      )

    case 'param':
      return (
        <>
          Used by parameter{' '}
          <strong>
            <code>{selector.name}</code>
          </strong>{' '}
          in URL-encoded body
        </>
      )

    case 'search':
      return (
        <>
          Used in query parameter{' '}
          <strong>
            <code>{selector.name}</code>
          </strong>
        </>
      )

    case 'css':
      return (
        <>
          Used by the element matching{' '}
          <strong>
            <code>{selector.rule}</code>
          </strong>{' '}
          in HTML body
        </>
      )

    default:
      return exhaustive(selector)
  }
}

interface UsageProps {
  request: ProxyData | undefined
  usage: Correlatable
}

function Usage({ request, usage }: UsageProps) {
  if (request === undefined) {
    return null
  }

  return (
    <Flex
      p="2"
      pl="4"
      gap="2"
      align="center"
      css={css`
        flex: 1 1 0;
      `}
    >
      <ArrowLeftRight size={12} />
      <div>
        <SelectorUsage selector={usage.value.selector} /> of{' '}
        <RequestLink request={request} />
      </div>
    </Flex>
  )
}

interface SuggestionProps {
  requests: ProxyData[]
  suggestion: GroupedCorrelation
}

export function Suggestion({
  requests,
  suggestion: correlation,
}: SuggestionProps) {
  const sourceRequest = requests[correlation.from.index]

  if (sourceRequest === undefined) {
    return null
  }

  return (
    <Accordion.AccordionItem
      value={correlation.id}
      css={css`
        font-size: 12px;
        background-color: var(--color-background);
      `}
    >
      <Accordion.Header asChild>
        <div
          css={css`
            display: flex;

            border-bottom: 1px solid var(--gray-3);

            &:first-of-type {
              border-top: 1px solid var(--gray-3);
            }

            &:hover,
            &[data-state='open'] {
              background-color: var(--gray-5);
            }

            & svg {
              transition: transform 200ms;
              transform: rotate(0deg);
            }

            &[data-state='open'] svg {
              transform: rotate(90deg);
            }
          `}
        >
          <Reset>
            <Accordion.Trigger
              css={css`
                display: flex;
                gap: var(--space-2);
                align-items: center;
                flex: 1 1 0;
                padding: var(--space-2);
                cursor: pointer;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              `}
            >
              <span>
                <ChevronRightIcon
                  css={css`
                    [data-state='open'] {
                      transform: rotate(90deg);
                    }
                  `}
                />
              </span>
              <span>
                <span>
                  <strong>
                    <Tooltip
                      content={formatExtractedValue(correlation.from.value)}
                    >
                      {formatSelector(correlation.from.value.selector)}
                    </Tooltip>
                  </strong>{' '}
                  in{' '}
                </span>
                <RequestLink request={sourceRequest} />
                <span> is used in {correlation.usages.length} requests.</span>
              </span>
            </Accordion.Trigger>
          </Reset>
        </div>
      </Accordion.Header>
      <Accordion.Content
        css={css`
          background-color: var(--gray-2);
        `}
      >
        {correlation.usages.map((usage, index) => {
          return (
            <Usage key={index} request={requests[usage.index]} usage={usage} />
          )
        })}
      </Accordion.Content>
    </Accordion.AccordionItem>
  )
}
