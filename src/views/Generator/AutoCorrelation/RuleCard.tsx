import { Box, Flex, IconButton, Switch, Text, Tooltip } from '@radix-ui/themes'
import {
  BracesIcon,
  CookieIcon,
  FileTextIcon,
  LinkIcon,
  LucideIcon,
  XIcon,
} from 'lucide-react'
import { memo, ReactNode } from 'react'

import { MethodBadge } from '@/components/MethodBadge'
import { SuggestionRow } from '@/components/SuggestionList/SuggestionRow'
import { TextWithTooltip } from '@/components/TextWithTooltip'
import { Method } from '@/types'
import { ExtractorSelector } from '@/types/rules'

import { SuggestedRuleEntry } from './types'

const MAX_REUSED_IN = 5

const sectionLabel = {
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
}

interface RequestPath {
  method: Method
  path: string
}

/**
 * How the row's right-hand control behaves: a committed rule can be
 * enabled/disabled (wizard), while a pending suggestion can be discarded
 * (standalone dialog).
 */
export type RuleCardAction =
  | { type: 'toggle'; enabled: boolean; onToggle: (ruleId: string) => void }
  | { type: 'remove'; onRemove: (ruleId: string) => void; disabled: boolean }

interface RuleCardProps {
  entry: SuggestedRuleEntry
  action: RuleCardAction
  isLast?: boolean
}

export const RuleCard = memo(function RuleCard({
  entry,
  action,
  isLast = false,
}: RuleCardProps) {
  const ruleId = entry.rule.id
  const ruleName = getRuleName(entry)
  const source = getSource(entry)
  const reusedIn = getReusedIn(entry)
  const visible = reusedIn.slice(0, MAX_REUSED_IN)
  const overflowCount = reusedIn.length - MAX_REUSED_IN
  const icon = getRuleIcon(entry)
  const extractedValue = entry.correlationState.extractedValue

  return (
    <SuggestionRow
      isLast={isLast}
      dimmed={action.type === 'toggle' && !action.enabled}
      icon={icon}
      name={ruleName}
      secondary={
        source && (
          <>
            <MethodBadge method={source.method}>{source.method}</MethodBadge>
            <Text
              css={{
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {source.path}
            </Text>
          </>
        )
      }
      controls={
        <RuleControl ruleId={ruleId} ruleName={ruleName} action={action} />
      }
      expandableContent={
        <RuleCardDetails
          extractedValue={extractedValue}
          source={source}
          visible={visible}
          reusedIn={reusedIn}
          overflowCount={overflowCount}
        />
      }
    />
  )
})

function RuleControl({
  ruleId,
  ruleName,
  action,
}: {
  ruleId: string
  ruleName: string
  action: RuleCardAction
}) {
  if (action.type === 'toggle') {
    return (
      <Switch
        size="1"
        checked={action.enabled}
        aria-label={`Enable ${ruleName} rule`}
        onCheckedChange={() => action.onToggle(ruleId)}
      />
    )
  }

  return (
    <IconButton
      variant="ghost"
      size="1"
      color="gray"
      onClick={() => action.onRemove(ruleId)}
      disabled={action.disabled}
      aria-label={`Remove ${ruleName} rule`}
    >
      <XIcon size={12} />
    </IconButton>
  )
}

interface RuleCardDetailsProps {
  extractedValue: string | undefined
  source: RequestPath | undefined
  visible: RequestPath[]
  reusedIn: RequestPath[]
  overflowCount: number
}

function RuleCardDetails({
  extractedValue,
  source,
  visible,
  reusedIn,
  overflowCount,
}: RuleCardDetailsProps) {
  return (
    <>
      {extractedValue && (
        <Box mt="3">
          <Text size="1" color="gray" css={sectionLabel}>
            Value
          </Text>
          <TextWithTooltip
            size="1"
            as="p"
            mt="1"
            color="gray"
            css={{
              fontFamily: 'var(--code-font-family)',
              cursor: 'default',
            }}
          >
            {extractedValue}
          </TextWithTooltip>
        </Box>
      )}

      {source && (
        <Box mt="3">
          <Text size="1" color="gray" css={sectionLabel}>
            Source
          </Text>
          <Box mt="1">
            <PathChip request={source} />
          </Box>
        </Box>
      )}

      {visible.length > 0 && (
        <Box mt="4">
          <Text size="1" color="gray" css={sectionLabel}>
            Reused in
          </Text>
          <Flex wrap="wrap" gap="1" mt="1">
            {visible.map((request, index) => (
              <PathChip
                key={`${request.method} ${request.path}-${index}`}
                request={request}
              />
            ))}
            {overflowCount > 0 && (
              <Tooltip
                content={
                  <Flex direction="column" gap="1">
                    {reusedIn.slice(MAX_REUSED_IN).map((r, index) => (
                      <Text key={`${r.method} ${r.path}-${index}`} size="1">
                        {r.method} {r.path}
                      </Text>
                    ))}
                  </Flex>
                }
              >
                <Text
                  size="1"
                  color="gray"
                  css={{
                    backgroundColor: 'var(--gray-a3)',
                    borderRadius: 'var(--radius-2)',
                    padding: '4px 10px',
                    cursor: 'default',
                    display: 'inline-block',
                  }}
                >
                  +{overflowCount} more
                </Text>
              </Tooltip>
            )}
          </Flex>
        </Box>
      )}
    </>
  )
}

function PathChip({ request }: { request: RequestPath }) {
  return (
    <Text
      size="1"
      as="span"
      css={{
        fontFamily: 'var(--code-font-family)',
        backgroundColor: 'var(--gray-a3)',
        borderRadius: 'var(--radius-2)',
        padding: '4px 10px',
        wordBreak: 'break-all',
        display: 'inline-block',
      }}
    >
      <MethodBadge method={request.method}>{request.method}</MethodBadge>{' '}
      {request.path}
    </Text>
  )
}

function getRuleIcon(entry: SuggestedRuleEntry): ReactNode {
  const { selector } = entry.rule.extractor
  const Icon = getSelectorIcon(selector)
  return <Icon size={14} />
}

function getSelectorIcon(selector: ExtractorSelector): LucideIcon {
  switch (selector.type) {
    case 'header-name':
      return /cookie/i.test(selector.name) ? CookieIcon : FileTextIcon
    case 'json':
      return BracesIcon
    case 'begin-end':
    case 'regex':
      switch (selector.from) {
        case 'body':
          return BracesIcon
        case 'headers':
          return FileTextIcon
        case 'url':
          return LinkIcon
      }
  }
}

function getRuleName(entry: SuggestedRuleEntry): string {
  const { rule } = entry
  if (rule.extractor.variableName) {
    return rule.extractor.variableName
  }

  const { selector } = rule.extractor
  switch (selector.type) {
    case 'json':
      return selector.path
    case 'header-name':
      return selector.name
    case 'begin-end':
      return `${selector.begin}...${selector.end}`
    case 'regex':
      return selector.regex.slice(0, 30)
    default:
      return 'rule'
  }
}

function getSource(entry: SuggestedRuleEntry): RequestPath | undefined {
  const source = entry.correlationState.responsesExtracted[0]
  if (!source) return undefined
  return { method: source.request.method, path: source.request.path }
}

function getReusedIn(entry: SuggestedRuleEntry): RequestPath[] {
  return entry.correlationState.requestsReplaced.map(({ original }) => ({
    method: original.method,
    path: original.path,
  }))
}
