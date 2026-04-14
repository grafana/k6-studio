import { vi } from 'vitest'

import { ActiveA2ASession } from '@/handlers/ai/a2a/session'

export function createA2ASession(
  overrides?: Partial<ActiveA2ASession>
): ActiveA2ASession {
  const session = new ActiveA2ASession(
    {
      read: vi.fn(),
      cancel: vi.fn().mockResolvedValue(undefined),
      releaseLock: vi.fn(),
      closed: Promise.resolve(undefined),
    } as unknown as ReadableStreamDefaultReader<Uint8Array>,
    undefined,
    new AbortController(),
    { baseUrl: '', agentId: '', bearerToken: '' }
  )
  if (overrides) {
    Object.assign(session, overrides)
  }
  return session
}
