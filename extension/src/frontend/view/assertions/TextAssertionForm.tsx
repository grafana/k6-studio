import { ChangeEvent, useEffect } from 'react'

import { FieldGrid } from '@/components/primitives/FieldGrid'
import { TextField } from '@/components/primitives/TextField'

import { client } from '../../routing'

import { TextAssertionData } from './types'

interface TextAssertionFormProps {
  assertion: TextAssertionData
  canEditSelector?: boolean
  onChange: (assertion: TextAssertionData) => void
}

export function TextAssertionForm({
  assertion,
  canEditSelector = false,
  onChange,
}: TextAssertionFormProps) {
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

  const handleTextChange = (ev: ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...assertion,
      text: ev.target.value,
    })
  }

  return (
    <>
      <FieldGrid>
        {canEditSelector && (
          <TextField
            size="1"
            label="Element"
            value={assertion.selector}
            onFocus={handleSelectorFocus}
            onBlur={handleSelectorBlur}
            onChange={handleSelectorChange}
          />
        )}
        <TextField
          size="1"
          label="Contains"
          value={assertion.text}
          onChange={handleTextChange}
        />
      </FieldGrid>
    </>
  )
}
