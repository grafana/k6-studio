import { css } from '@emotion/react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Box,
  Button,
  Callout,
  Checkbox,
  Flex,
  Heading,
  Spinner,
  Text,
  TextField,
  Tooltip,
} from '@radix-ui/themes'
import {
  AlertTriangleIcon,
  DiscIcon,
  InfoIcon,
  TriangleAlertIcon,
} from 'lucide-react'
import { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { useLocalStorage } from 'react-use'
import { z } from 'zod'

import { FieldGroup } from '@/components/Form'
import { ProxyHealthWarning } from '@/components/ProxyHealthWarning'
import { TextButton } from '@/components/TextButton'
import { LaunchBrowserOptions } from '@/handlers/browser/types'
import { useProxyHealthCheck } from '@/hooks/useProxyHealthCheck'
import { useProxyStatus } from '@/hooks/useProxyStatus'
import { useRecentURLs } from '@/hooks/useRecentURLs'
import { useBrowserCheck, useSettings } from '@/hooks/useSettings'
import { useStudioUIStore } from '@/store/ui'
import { ProxyStatus } from '@/types'

import { RecentURLs } from './RecentURLs'

interface EmptyStateProps {
  isLoading: boolean
  onStart: (options: LaunchBrowserOptions) => void
}

const RecorderEmptyStateSchema = z.object({ url: z.string() })

type RecorderEmptyStateFields = z.infer<typeof RecorderEmptyStateSchema>

export function EmptyState({ isLoading, onStart }: EmptyStateProps) {
  const { data: settings } = useSettings()

  const proxyStatus = useProxyStatus()
  const { data: isBrowserInstalled } = useBrowserCheck()

  const [captureBrowser = true, setCaptureBrowser] = useLocalStorage(
    'start-recording.capture.browser',
    true
  )

  const browserRecorder = settings?.recorder.browserRecording ?? 'disabled'

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RecorderEmptyStateFields>({
    resolver: zodResolver(RecorderEmptyStateSchema),
    defaultValues: { url: '' },
    shouldFocusError: false,
  })

  const { recentURLs, addURL, removeURL } = useRecentURLs()

  const canRecord = proxyStatus === 'online' && isBrowserInstalled === true

  const onSubmit = ({ url }: RecorderEmptyStateFields) => {
    if (isLoading || !canRecord) {
      return
    }

    addURL(url)

    onStart({
      url,
      capture: { browser: browserRecorder !== 'disabled' && captureBrowser },
    })
  }

  const handleCaptureBrowserChange = (value: boolean | 'indeterminate') => {
    setCaptureBrowser(value === true)
  }

  const handleSelectURL = (url: string) => {
    setValue('url', url)
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
        <Flex direction="column" gap="4">
          <div>
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
                  <Spinner loading={isLoading}>
                    <DiscIcon />
                  </Spinner>
                  Start recording
                </Button>
              </Flex>
            </FieldGroup>

            <RecentURLs
              urls={recentURLs}
              disabled={isLoading}
              onSelectURL={handleSelectURL}
              onRemoveURL={removeURL}
            />

            <WarningMessage
              proxyStatus={proxyStatus}
              isBrowserInstalled={isBrowserInstalled}
              isSSLInsecureEnabled={settings?.proxy.sslInsecure}
            />
          </div>

          {browserRecorder !== 'disabled' && (
            <BrowserEventsSection>
              <Text as="label" size="2">
                <Flex gap="2" align="center">
                  <Checkbox
                    disabled={!canRecord}
                    checked={captureBrowser}
                    onCheckedChange={handleCaptureBrowserChange}
                  />
                  <span>Capture browser events</span>
                </Flex>
              </Text>
            </BrowserEventsSection>
          )}
        </Flex>
      </form>
    </Flex>
  )
}

interface BrowserEventsSectionProps {
  children: ReactNode
}

function BrowserEventsSection({ children }: BrowserEventsSectionProps) {
  return (
    <Flex direction="column" gap="1">
      <Text size="2" weight="medium">
        <Flex align="center" gap="1">
          <span>
            Browser Events{' '}
            <Text size="1" weight="light">
              (Preview)
            </Text>
          </span>
          <Tooltip
            content={
              <>
                This will enable capture of user interactions such as clicks and
                navigation. Recordings with these events can later be used to
                export a k6 browser script.
              </>
            }
          >
            <InfoIcon />
          </Tooltip>
        </Flex>
      </Text>
      <Text size="1" as="p" color="gray" mb="1">
        Record user interactions in the browser alongside network requests.
      </Text>
      <Box>{children}</Box>
    </Flex>
  )
}

interface WarningMessageProps {
  proxyStatus: ProxyStatus
  isBrowserInstalled?: boolean
  isSSLInsecureEnabled?: boolean
}

function WarningMessage({
  proxyStatus,
  isBrowserInstalled,
  isSSLInsecureEnabled,
}: WarningMessageProps) {
  const openSettingsDialog = useStudioUIStore(
    (state) => state.openSettingsDialog
  )

  const { isProxyHealthy } = useProxyHealthCheck(proxyStatus)

  const handleProxyStart = () => {
    return window.studio.proxy.launchProxy()
  }

  if (isBrowserInstalled === false) {
    return (
      <Callout.Root>
        <Callout.Icon>
          <TriangleAlertIcon />
        </Callout.Icon>
        <Callout.Text>
          <strong>Supported browser not found</strong>
          <br />
          Google Chrome or Chromium needs to be installed on your machine for
          the recording functionality to work. If the browser is installed,
          specify the path in{' '}
          <TextButton onClick={() => openSettingsDialog('recorder')}>
            Settings
          </TextButton>
          .
        </Callout.Text>
      </Callout.Root>
    )
  }

  if (proxyStatus === 'online' && (!isProxyHealthy || isSSLInsecureEnabled)) {
    return (
      <Flex direction="column" gap="2">
        {!isProxyHealthy && <ProxyHealthWarning />}

        {isSSLInsecureEnabled && (
          <Callout.Root>
            <Callout.Icon>
              <AlertTriangleIcon />
            </Callout.Icon>
            <Callout.Text>
              <strong>SSL/TLS certificate validation will be skipped</strong>
              <br />
              Recording with this option enabled introduces vulnerability to
              man-in-the-middle (MITM) attacks. Use carefully or disable it in{' '}
              <TextButton onClick={() => openSettingsDialog('proxy')}>
                Settings
              </TextButton>
              .
            </Callout.Text>
          </Callout.Root>
        )}
      </Flex>
    )
  }

  if (proxyStatus === 'offline') {
    return (
      <Callout.Root>
        <Callout.Icon>
          <TriangleAlertIcon />
        </Callout.Icon>
        <Callout.Text>
          <strong>Proxy is offline</strong>
          <br />
          <TextButton onClick={handleProxyStart}>Start proxy</TextButton> or
          check proxy configuration in{' '}
          <TextButton onClick={() => openSettingsDialog('proxy')}>
            Settings
          </TextButton>
          .
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
