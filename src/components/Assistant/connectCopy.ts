import type { AssistantConnection } from '@/handlers/ai/a2a/tokenRefresh'

type ConnectCopy = {
  title: string
  description: string
  action: string
}

/**
 * Both states send the user through the same connect flow. Every surface that
 * gates on the assistant reads its wording here so they stay in step.
 */
export const CONNECT_COPY: Record<
  Exclude<AssistantConnection, 'connected'>,
  ConnectCopy
> = {
  disconnected: {
    title: 'Connect to Grafana Assistant',
    description:
      'Approve the connection so the Assistant can analyze your recording.',
    action: 'Connect to Grafana Assistant',
  },
  expired: {
    title: 'Your session has expired',
    description: 'Reconnect to Grafana Assistant to continue.',
    action: 'Reconnect',
  },
}
