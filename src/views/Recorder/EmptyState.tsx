import { css } from '@emotion/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { DiscIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons'
import {
  Button,
  Callout,
  Flex,
  Heading,
  Spinner,
  Text,
  TextField,
} from '@radix-ui/themes'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { FieldGroup } from '@/components/Form'
import { useProxyStatus } from '@/hooks/useProxyStatus'
import { useStudioUIStore } from '@/store/ui'
import { TextButton } from '@/components/TextButton'
import { useBrowserCheck } from '@/hooks/useSettings'
import { ProxyStatus } from '@/types'

interface EmptyStateProps {
  isLoading: boolean
  onStart: (url?: string) => void
}

const RecorderEmptyStateSchema = z.object({
  url: z.string(),
})

type RecorderEmptyStateFields = z.infer<typeof RecorderEmptyStateSchema>

export function EmptyState({ isLoading, onStart }: EmptyStateProps) {
  const proxyStatus = useProxyStatus()
  const { data: isBrowserInstalled } = useBrowserCheck()

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
  const canRecord = proxyStatus === 'online' && isBrowserInstalled === true

  const onSubmit = ({ url }: RecorderEmptyStateFields) => {
    if (isLoading || !canRecord) {
      return
    }

    onStart(url)
  }

  return (
    <Flex
      direction="column"
      align="center"
      gap="2"
      pt="90px"
      px="2"
      mx="auto"
      maxWidth="616px"
      width="100%"
    >
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
          width: 100%;
          margin-top: var(--space-6);
        `}
      >
        <FieldGroup
          name="url"
          label="Starting URL"
          hint="Enter the URL of the website or service you want to test"
          hintType="text"
          errors={errors}
          width="100%"
        >
          <Flex>
            <TextField.Root
              {...register('url')}
              placeholder="e.g. quickpizza.grafana.com"
              autoFocus
              css={css`
                flex-grow: 1;
                border-right: 0;
                border-bottom-right-radius: 0;
                border-top-right-radius: 0;
              `}
            />
            <Button
              disabled={isLoading || !canRecord}
              type="submit"
              css={css`
                margin-left: -1px;
                border-bottom-left-radius: 0;
                border-top-left-radius: 0;
              `}
            >
              {isLoading ? <Spinner /> : <DiscIcon />} Start recording
            </Button>
          </Flex>
        </FieldGroup>
        <WarningMessage
          proxyStatus={proxyStatus}
          isBrowserInstalled={isBrowserInstalled}
        />
      </form>
    </Flex>
  )
}

interface WarningMessageProps {
  proxyStatus: ProxyStatus
  isBrowserInstalled?: boolean
}

function WarningMessage({
  proxyStatus,
  isBrowserInstalled,
}: WarningMessageProps) {
  const setIsSettingsDialogOpen = useStudioUIStore(
    (state) => state.setIsSettingsDialogOpen
  )

  const handleOpenSettings = () => {
    setIsSettingsDialogOpen(true)
  }

  if (isBrowserInstalled === false) {
    return (
      <Callout.Root>
        <Callout.Icon>
          <ExclamationTriangleIcon />
        </Callout.Icon>
        <Callout.Text>
          <strong>Supported browser not found</strong>
          <br />
          Google Chrome needs to be installed on your machine for the recording
          functionality to work. If the browser is installed, specify the path
          in <TextButton onClick={handleOpenSettings}>Settings</TextButton>.
        </Callout.Text>
      </Callout.Root>
    )
  }

  if (proxyStatus === 'offline') {
    return (
      <Callout.Root>
        <Callout.Icon>
          <ExclamationTriangleIcon />
        </Callout.Icon>
        <Callout.Text>
          <strong>Proxy is offline</strong>
          <br />
          Check proxy configuration in{' '}
          <TextButton onClick={handleOpenSettings}>Settings</TextButton>.
        </Callout.Text>
      </Callout.Root>
    )
  }

  if (proxyStatus === 'starting') {
    return (
      <Flex gap="1" align="center">
        <Spinner />
        <Text size="1" color="gray">
          Proxy is starting
        </Text>
      </Flex>
    )
  }

  return null
}
