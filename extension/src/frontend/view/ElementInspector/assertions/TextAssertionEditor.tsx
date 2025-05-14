import { css } from '@emotion/react'
import { ChangeEvent, useEffect, useId } from 'react'

import { Flex } from '@/components/primitives/Flex'
import { Input } from '@/components/primitives/Input'
import { Label } from '@/components/primitives/Label'
import { TextArea } from '@/components/primitives/TextArea'

import { client } from '../../../routing'

import { AssertionForm } from './AssertionForm'
import { TextAssertionData } from './types'

interface TextAssertionEditorProps {
  assertion: TextAssertionData
  canEditSelector?: boolean
  onChange: (assertion: TextAssertionData) => void
  onSubmit: (assertion: TextAssertionData) => void
}

export function TextAssertionEditor({
  assertion,
  canEditSelector = false,
  onChange,
  onSubmit,
}: TextAssertionEditorProps) {
  const selectorId = useId()
  const containsId = useId()

  useEffect(() => {
    return () => {
      client.send({
        type: 'highlight-elements',
        selector: null,
      })
    }
  }, [])

  const handleSelectorFocus = () => {
    client.send({
      type: 'highlight-elements',
      selector: {
        type: 'css',
        selector: assertion.selector,
      },
    })
  }

  const handleSelectorBlur = () => {
    client.send({
      type: 'highlight-elements',
      selector: null,
    })
  }

  const handleSelectorChange = (ev: ChangeEvent<HTMLInputElement>) => {
    client.send({
      type: 'highlight-elements',
      selector: {
        type: 'css',
        selector: ev.target.value,
      },
    })

    onChange({
      ...assertion,
      selector: ev.target.value,
    })
  }

  const handleTextChange = (ev: ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      ...assertion,
      text: ev.target.value,
    })
  }

  const handleSubmit = () => {
    onSubmit(assertion)
  }

  return (
    <AssertionForm onSubmit={handleSubmit}>
      {canEditSelector && (
        <Flex direction="column" align="stretch" gap="1">
          <Label htmlFor={selectorId} size="1">
            Selector
          </Label>
          <Input
            id={selectorId}
            size="1"
            value={assertion.selector}
            onFocus={handleSelectorFocus}
            onBlur={handleSelectorBlur}
            onChange={handleSelectorChange}
          />
        </Flex>
      )}
      <Flex direction="column" align="stretch" gap="1">
        <Label htmlFor={containsId} size="1">
          Assert that element contains text
        </Label>
        <TextArea
          id={containsId}
          css={css`
            min-height: 100px;
            min-width: 400px;
            resize: vertical;
          `}
          size="1"
          value={assertion.text}
          onChange={handleTextChange}
        />
      </Flex>
    </AssertionForm>
  )
}
