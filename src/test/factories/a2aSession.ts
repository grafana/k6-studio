import { vi } from 'vitest'

import type { ActiveA2ASession } from '@/handlers/ai/a2a/types'

export function createA2ASession(
  overrides?: Partial<ActiveA2ASession>
): ActiveA2ASession {
  return {
    reader: {
      read: vi.fn(),
      cancel: vi.fn().mockResolvedValue(undefined),
      releaseLock: vi.fn(),
      closed: Promise.resolve(undefined),
    } as unknown as ReadableStreamDefaultReader<Uint8Array>,
    contextId: undefined,
    taskId: undefined,
    sessionAbortController: new AbortController(),
    config: { baseUrl: '', agentId: '', bearerToken: '' },
    pendingToolRequests: new Map(),
    unmatchedToolCalls: [],
    unmatchedRemoteRequests: [],
    sseBuffer: '',
    readyToFinishForTools: false,
    activeStreamArtifactId: undefined,
    activeStreamContentType: undefined,
    ...overrides,
  }
}
