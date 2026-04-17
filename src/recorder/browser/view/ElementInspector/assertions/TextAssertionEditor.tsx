import { css } from '@emotion/react'
import { ChangeEvent, useEffect, useId } from 'react'

import { Flex } from '@/components/primitives/Flex'
import { Label } from '@/components/primitives/Label'
import { TextArea } from '@/components/primitives/TextArea'

import { useStudioClient } from '../../StudioClientProvider'

import { AssertionForm } from './AssertionForm'
import { TextAssertionData } from './types'

interface TextAssertionEditorProps {
  assertion: TextAssertionData
  onCancel: () => void
  onChange: (assertion: TextAssertionData) => void
  onSubmit: (assertion: TextAssertionData) => void
}

export function TextAssertionEditor({
  assertion,
  onCancel,
  onChange,
  onSubmit,
}: TextAssertionEditorProps) {
  const client = useStudioClient()

  const containsId = useId()

  useEffect(() => {
    return () => {
      client.send({
        type: 'highlight-elements',
        selector: null,
      })
    }
  }, [client])

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
    <AssertionForm onCancel={onCancel} onSubmit={handleSubmit}>
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
