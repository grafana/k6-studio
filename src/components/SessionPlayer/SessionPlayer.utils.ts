import { DebugSession } from '@/views/Validator/types'

import { Page } from './types'

export type PageState =
  /** We're waiting for the session to start. */
  | 'pending'
  /** We're streaming, but haven't received the first page yet. */
  | 'waiting-for-initial'
  /** We have a page, but we're still waiting on the first frame for it. */
  | 'transitioning'
  /** We've received the first frame for the page and can start showing the content. */
  | 'loaded'
  /** The session ended without any page loads. */
  | 'no-page'

export function getPageState(
  session: DebugSession,
  page: Page | undefined,
  loading: boolean
): PageState {
  if (session.state === 'pending') {
    return 'pending'
  }

  if (session.state === 'stopped' && page === undefined) {
    return 'no-page'
  }

  if (page === undefined) {
    return 'waiting-for-initial'
  }

  if (loading) {
    return 'transitioning'
  }

  return 'loaded'
}
