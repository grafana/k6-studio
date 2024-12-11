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
import { Flex, IconButton, Reset, Tooltip } from '@radix-ui/themes'
import { CheckIcon, TextSearch, XIcon } from 'lucide-react'
import { ReactNode } from 'react'
import { RequestLink } from './RequestLink'
import { formatJsonPath } from '@/utils/json'

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
          Used by property{' '}
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
      gap="2"
      align="center"
      css={css`
        flex: 1 1 0;
      `}
    >
      <TextSearch strokeWidth={2} size={14} />
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
  onApply: (suggestion: GroupedCorrelation) => void
}

export function Suggestion({ requests, suggestion, onApply }: SuggestionProps) {
  const sourceRequest = requests[suggestion.from.index]

  function handleApply() {
    onApply(suggestion)
  }

  if (sourceRequest === undefined) {
    return null
  }

  return (
    <Accordion.AccordionItem
      value={suggestion.id}
      css={css`
        font-size: 12px;
        background-color: var(--color-background);
      `}
    >
      <Accordion.Header asChild>
        <Flex
          align="center"
          gap="3"
          pr="4"
          css={css`
            border-bottom: 1px solid var(--gray-3);

            &:first-of-type {
              border-top: 1px solid var(--gray-3);
            }

            &:hover,
            &[data-state='open'] {
              background-color: var(--gray-5);
            }

            & svg.chevron {
              transition: transform 200ms;
              transform: rotate(0deg);
            }

            &[data-state='open'] svg.chevron {
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
              <Flex as="span" align="center">
                <ChevronRightIcon
                  className="chevron"
                  css={css`
                    [data-state='open'] {
                      transform: rotate(90deg);
                    }
                  `}
                />
              </Flex>
              <span
                css={css`
                  display: inline-block;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                `}
              >
                <strong>
                  <Tooltip
                    content={formatExtractedValue(suggestion.from.value)}
                  >
                    {formatSelector(suggestion.from.value.selector)}
                  </Tooltip>
                </strong>{' '}
                in <RequestLink request={sourceRequest} />
                is used in {suggestion.usages.length} requests.
              </span>
            </Accordion.Trigger>
          </Reset>
          <Flex align="center" gap="2">
            <IconButton
              variant="ghost"
              size="1"
              color="green"
              onClick={handleApply}
            >
              <CheckIcon size={12} />
            </IconButton>
            <IconButton
              variant="ghost"
              size="1"
              color="red"
              onClick={handleApply}
            >
              <XIcon size={12} />
            </IconButton>
          </Flex>
        </Flex>
      </Accordion.Header>
      <Accordion.Content
        css={css`
          background-color: var(--gray-2);
          padding-left: var(--space-5);
        `}
      >
        {suggestion.usages.map((usage, index) => {
          return (
            <Usage key={index} request={requests[usage.index]} usage={usage} />
          )
        })}
      </Accordion.Content>
    </Accordion.AccordionItem>
  )
}
