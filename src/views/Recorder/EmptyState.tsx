import { css } from '@emotion/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { DiscIcon } from '@radix-ui/react-icons'
import { Button, Flex, Heading, Text, TextField } from '@radix-ui/themes'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { FieldGroup } from '@/components/Form'

interface EmptyStateProps {
  isLoading: boolean
  onStart: (url?: string) => void
}

const RecorderEmptyStateSchema = z.object({
  url: z.string(),
})

type RecorderEmptyStateFields = z.infer<typeof RecorderEmptyStateSchema>

export function EmptyState({ isLoading, onStart }: EmptyStateProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecorderEmptyStateFields>({
    resolver: zodResolver(RecorderEmptyStateSchema),
    defaultValues: {
      url: '',
    },
    shouldFocusError: false,
  })

  const onSubmit = ({ url }: RecorderEmptyStateFields) => {
    onStart(url)
  }

  return (
    <Flex direction="column" align="center" gap="2" pt="90px">
      <Heading
        size="8"
        css={css`
          font-weight: 400;
        `}
      >
        Record your user flow
      </Heading>
      <Text color="gray" size="1">
        Once you begin recording, requests will appear in this area
      </Text>
      <form
        onSubmit={handleSubmit(onSubmit)}
        css={css`
          margin-top: var(--space-6);
        `}
      >
        <FieldGroup
          name="url"
          label="Starting URL"
          hint="Enter the URL of the website or service you want to test"
          hintType="text"
          errors={errors}
          width="460px"
        >
          <TextField.Root
            {...register('url')}
            placeholder="e.g. quickpizza.grafana.com"
            autoFocus
            css={css`
              flex-grow: 1;
              border-bottom-right-radius: 0;
              border-top-right-radius: 0;
            `}
          />
        </FieldGroup>
        <Button disabled={isLoading} type="submit">
          <DiscIcon /> Start recording
        </Button>
      </form>
    </Flex>
  )
}
