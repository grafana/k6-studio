import { TextField, Text } from '@radix-ui/themes'
import { useEffect, useState } from 'react'

import { FieldGroup } from '@/components/Form/FieldGroup'

import { FormPopover } from '../Shared/FormPopover'

interface UrlInputProps {
  value: string
  onChange: (value: string) => void
}

export function UrlInput({ value, onChange }: UrlInputProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [url, setUrl] = useState(value)

  const [error, setError] = useState<string | null>(null)

  const handlePopoverOpenChange = (open: boolean) => {
    setIsPopoverOpen(open)
    if (!open) {
      onChange(url)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handlePopoverOpenChange(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value)
  }

  useEffect(() => {
    try {
      new URL(url)
      setError(null)
    } catch {
      setError('Invalid URL')
    }
  }, [url])

  useEffect(() => {
    setUrl(value)
  }, [value])

  return (
    <FormPopover
      open={isPopoverOpen}
      displayValue={value || 'Enter URL'}
      error={error}
      onOpenChange={setIsPopoverOpen}
    >
      <form onSubmit={handleSubmit}>
        <FieldGroup name="url" label="URL" labelSize="1" mb="0">
          <TextField.Root
            size="1"
            id="url"
            color={error ? 'red' : 'gray'}
            value={url}
            onChange={handleChange}
            placeholder="e.g. https://quickpizza.grafana.com"
          />
          {error && (
            <Text size="1" color="red" mt="1">
              {error}
            </Text>
          )}
        </FieldGroup>
      </form>
    </FormPopover>
  )
}
