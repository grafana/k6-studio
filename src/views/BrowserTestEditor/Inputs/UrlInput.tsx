import {
  Badge,
  Popover,
  TextField,
  Tooltip,
  Button,
  Text,
} from '@radix-ui/themes'
import { TriangleAlertIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

interface UrlInputProps {
  value: string
  onChange: (value: string) => void
}

export function UrlInput({ value, onChange }: UrlInputProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [url, setUrl] = useState(value)

  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onChange(url)
    setIsPopoverOpen(false)
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
    <Popover.Root open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <Popover.Trigger>
        <Badge color={error ? 'red' : 'gray'} asChild>
          <Button size="1">
            {value}
            {error && (
              <Tooltip content={error}>
                <TriangleAlertIcon />
              </Tooltip>
            )}
          </Button>
        </Badge>
      </Popover.Trigger>
      <Popover.Content align="start" size="1" width="300px">
        <form onSubmit={handleSubmit}>
          <TextField.Root
            size="1"
            color={error ? 'red' : 'gray'}
            value={url}
            onChange={handleChange}
            onBlur={handleSubmit}
            placeholder="e.g. https://quickpizza.grafana.com"
          />
          {error && (
            <Text size="1" color="red" mt="1">
              {error}
            </Text>
          )}
        </form>
      </Popover.Content>
    </Popover.Root>
  )
}
