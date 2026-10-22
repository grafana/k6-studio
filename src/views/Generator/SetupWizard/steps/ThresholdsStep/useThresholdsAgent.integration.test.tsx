import { act, renderHook, waitFor } from '@testing-library/react'
import { UIMessageChunk } from 'ai'
import { PropsWithChildren } from 'react'
import { beforeEach, expect, it, vi } from 'vitest'

import { useGeneratorStore } from '@/store/generator'

import { initialWizardState } from '../../state/reducer'
import {
  SetupWizardProvider,
  useSetupWizard,
} from '../../state/SetupWizardContext'

import { useThresholdsAgent } from './useThresholdsAgent'

const transport = vi.hoisted(() => ({ sendMessages: vi.fn() }))

vi.mock('@/utils/assistant/IPCChatTransport', () => ({
  IPCChatTransport: class {
    sendMessages = transport.sendMessages
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('studio', { app: { trackEvent: vi.fn() } })
  useGeneratorStore.setState({
    requests: [],
    thresholds: [],
    wizardUsed: false,
  })
})

it('commits thresholds when finish arrives before suggestions in the same streamed turn', async () => {
  let controller: ReadableStreamDefaultController<UIMessageChunk>
  transport.sendMessages
    .mockImplementationOnce(() =>
      Promise.resolve(
        new ReadableStream<UIMessageChunk>({
          start(stream) {
            controller = stream
          },
        })
      )
    )
    .mockImplementation(() =>
      Promise.resolve(
        new ReadableStream<UIMessageChunk>({
          start(stream) {
            stream.close()
          },
        })
      )
    )
  const { result } = renderHook(
    () => ({
      agent: useThresholdsAgent(),
      wizard: useSetupWizard().state,
    }),
    {
      wrapper: ({ children }: PropsWithChildren) => (
        <SetupWizardProvider
          initialState={{
            ...initialWizardState,
            screen: 'wizard',
            activeStep: 'thresholds',
          }}
        >
          {children}
        </SetupWizardProvider>
      ),
    }
  )

  act(() => result.current.agent.start())
  await waitFor(() => expect(transport.sendMessages).toHaveBeenCalledOnce())

  await act(() => {
    controller.enqueue({ type: 'start', messageId: 'thresholds' })
    controller.enqueue({ type: 'start-step' })
    controller.enqueue({
      type: 'tool-input-available',
      toolCallId: 'finish',
      toolName: 'finish',
      input: { outcome: 'success' },
    })
    return Promise.resolve()
  })
  expect(result.current.wizard.steps.thresholds.status).toBe('running')

  await act(() => {
    controller.enqueue({
      type: 'tool-input-available',
      toolCallId: 'suggest',
      toolName: 'suggestThresholds',
      input: {
        thresholds: [
          {
            metric: 'http_req_duration',
            statistic: 'p(95)',
            condition: '<',
            value: 600,
            stopTest: false,
            rationale: 'Observed p95 was 450 ms.',
          },
        ],
      },
    })
    controller.enqueue({ type: 'finish-step' })
    controller.enqueue({ type: 'finish', finishReason: 'tool-calls' })
    controller.close()
    return Promise.resolve()
  })

  await waitFor(() =>
    expect(result.current.wizard.steps.thresholds.status).toBe('completed')
  )
  expect(useGeneratorStore.getState().thresholds).toEqual([
    expect.objectContaining({ metric: 'http_req_duration', value: 600 }),
  ])
  expect(useGeneratorStore.getState().wizardUsed).toBe(true)
  expect(result.current.wizard.steps.thresholds).toMatchObject({
    log: [
      expect.objectContaining({
        type: 'info',
        text: 'Analyzing response times across **0 requests**',
      }),
      expect.objectContaining({
        type: 'found',
        text: 'Suggested **1 thresholds**',
      }),
    ],
  })
})
