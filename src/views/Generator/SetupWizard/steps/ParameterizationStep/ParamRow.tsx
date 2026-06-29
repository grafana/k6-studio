import { Flex, IconButton, Switch, Text, TextField } from '@radix-ui/themes'
import {
  BracesIcon,
  FileTextIcon,
  LinkIcon,
  LucideIcon,
  PencilIcon,
} from 'lucide-react'
import { useState } from 'react'

import { MethodBadge } from '@/components/MethodBadge'
import { SuggestionRow } from '@/components/SuggestionList/SuggestionRow'
import { useGeneratorStore } from '@/store/generator'
import { ParameterizationRule } from '@/types/rules'

import { ParamSuggestionMeta } from '../../state/types'

const MONO = 'var(--code-font-family)'
const FIELD_HEIGHT = 'var(--space-6)'
const FIELD_WIDTH = 280

function getLocationIcon(
  location: ParamSuggestionMeta['location']
): LucideIcon {
  switch (location.in) {
    case 'body':
      return BracesIcon
    case 'headers':
      return FileTextIcon
    case 'query':
    case 'url':
      return LinkIcon
  }
}

function ValueChip({
  value,
  field,
  onEdit,
}: {
  value: string
  field: string
  onEdit: () => void
}) {
  return (
    <Flex
      align="center"
      gap="2"
      css={{
        flexShrink: 0,
        width: FIELD_WIDTH,
        height: FIELD_HEIGHT,
        paddingLeft: 'var(--space-3)',
        paddingRight: 'var(--space-1)',
        borderRadius: 'var(--radius-3)',
        background: 'var(--gray-2)',
        border: '1px solid var(--gray-4)',
      }}
    >
      <Text
        css={{
          flex: 1,
          minWidth: 0,
          fontFamily: MONO,
          fontSize: 13,
          color: value ? 'var(--gray-12)' : 'var(--gray-9)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {value || 'empty'}
      </Text>
      <IconButton
        size="1"
        variant="ghost"
        color="gray"
        aria-label={`Edit ${field}`}
        onClick={onEdit}
        css={{ flexShrink: 0 }}
      >
        <PencilIcon size={12} />
      </IconButton>
    </Flex>
  )
}

function ValueEditor({
  variableName,
  initialValue,
  onCommit,
  onCancel,
}: {
  variableName: string
  initialValue: string
  onCommit: (value: string) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState(initialValue)

  return (
    <TextField.Root
      autoFocus
      size="2"
      value={draft}
      aria-label={`Value of ${variableName}`}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => onCommit(draft)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          onCommit(draft)
        }
        if (event.key === 'Escape') {
          onCancel()
        }
      }}
      css={{
        flexShrink: 0,
        width: FIELD_WIDTH,
        height: FIELD_HEIGHT,
        fontFamily: MONO,
      }}
    />
  )
}

function ValueColumn({
  isEditing,
  variableName,
  field,
  value,
  onEdit,
  onCommit,
  onCancel,
}: {
  isEditing: boolean
  variableName: string
  field: string
  value: string
  onEdit: () => void
  onCommit: (value: string) => void
  onCancel: () => void
}) {
  if (isEditing) {
    return (
      <ValueEditor
        variableName={variableName}
        initialValue={value}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    )
  }

  return <ValueChip value={value} field={field} onEdit={onEdit} />
}

interface ParamRowProps {
  meta: ParamSuggestionMeta
  rule: ParameterizationRule
  isLast: boolean
}

export function ParamRow({ meta, rule, isLast }: ParamRowProps) {
  const variables = useGeneratorStore((store) => store.variables)
  const setVariables = useGeneratorStore((store) => store.setVariables)
  const toggleEnableRule = useGeneratorStore((state) => state.toggleEnableRule)

  const [isEditing, setIsEditing] = useState(false)

  const variableName =
    rule.value.type === 'variable' ? rule.value.variableName : meta.field
  const variable = variables.find(
    (candidate) => candidate.name === variableName
  )

  const handleCommit = (value: string) => {
    setVariables(
      variables.map((candidate) =>
        candidate.name === variableName ? { ...candidate, value } : candidate
      )
    )
    setIsEditing(false)
  }

  const Icon = getLocationIcon(meta.location)

  return (
    <SuggestionRow
      isLast={isLast}
      dimmed={!rule.enabled}
      icon={<Icon size={14} />}
      name={meta.field}
      secondary={
        <>
          <MethodBadge method={meta.location.method}>
            {meta.location.method}
          </MethodBadge>
          <Text
            css={{
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {meta.location.path}
          </Text>
        </>
      }
      controls={
        <>
          <ValueColumn
            isEditing={isEditing}
            variableName={variableName}
            field={meta.field}
            value={variable?.value ?? ''}
            onEdit={() => setIsEditing(true)}
            onCommit={handleCommit}
            onCancel={() => setIsEditing(false)}
          />
          <Switch
            size="1"
            checked={rule.enabled}
            aria-label={`Enable ${meta.field} rule`}
            onCheckedChange={() => toggleEnableRule(rule.id)}
          />
        </>
      }
    />
  )
}
