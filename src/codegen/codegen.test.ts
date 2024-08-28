import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import {
  generateScript,
  generateRequestSnippets,
  generateVariableDeclarations,
  generateGroupSnippet,
} from './codegen'
import { CorrelationStateMap, TestRule } from '@/types/rules'
import { generateSequentialInt } from '@/rules/utils'
import { ProxyData } from '@/types'
import { correlationRecording } from '@/test/fixtures/correlationRecording'
import { ThinkTime } from '@/types/testOptions'

describe('Code generation', () => {
  beforeAll(() => {
    vi.mock('./options', () => ({
      generateOptions: () => '{}',
    }))
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  describe('generateScript', () => {
    it('should generate script', () => {
      const expectedResult = `
      import { group, sleep } from 'k6'
      import http from 'k6/http'

      export const options = {}

      const VARS = {}

      export default function() {
        let params
        let resp
        let match
        let regex
        let url
        const CORRELATION_VARS = {}
        sleep(1)
      }
      `

      expect(
        generateScript({
          recording: {},
          generator: {
            version: '0',
            recordingPath: 'test',
            options: {
              loadProfile: {
                executor: 'shared-iterations',
                startTime: '0',
                vus: 1,
                iterations: 1,
                maxDuration: '1',
              },
              thinkTime: {
                sleepType: 'iterations',
                timing: {
                  type: 'fixed',
                  value: 1,
                },
              },
            },
            testData: {
              variables: [],
            },
            rules: [],
            allowlist: [],
          },
        }).replace(/\s/g, '')
      ).toBe(expectedResult.replace(/\s/g, ''))
    })
  })

  describe('generateVariableDeclarations', () => {
    it('should generate variable declarations', () => {
      const variables = [
        {
          name: 'test',
          value: 'test',
        },
      ]

      const expectedResult = `
        const VARS = {"test": "test",}
      `

      expect(generateVariableDeclarations(variables).replace(/\s/g, '')).toBe(
        expectedResult.replace(/\s/g, '')
      )
    })
  })

  describe('generateRequestSnippets', () => {
    it('should generate request snippets', () => {
      const recording: ProxyData[] = [
        {
          id: '1',
          request: {
            method: 'GET',
            url: '/api/v1/users',
            headers: [],
            cookies: [],
            query: [],
            scheme: 'http',
            host: 'localhost:3000',
            content: '',
            path: '/api/v1/users',
            timestampStart: 0,
            timestampEnd: 0,
            contentLength: 0,
            httpVersion: '1.1',
          },
        },
      ]

      const rules: TestRule[] = []
      const correlationStateMap: CorrelationStateMap = {}
      const sequentialIdGenerator = generateSequentialInt()
      const thinkTime: ThinkTime = {
        sleepType: 'iterations',
        timing: {
          type: 'fixed',
          value: 1,
        },
      }

      const expectedResult = `
        params = { headers: {}, cookies: {} }
        url = http.url\`/api/v1/users\`
        resp = http.request('GET', url, null, params)
      `

      expect(
        generateRequestSnippets(
          recording,
          rules,
          correlationStateMap,
          sequentialIdGenerator,
          thinkTime
        ).replace(/\s/g, '')
      ).toBe(expectedResult.replace(/\s/g, ''))
    })

    it('should replace correlated values', () => {
      const rules: TestRule[] = [
        {
          type: 'correlation',
          id: '1',
          extractor: {
            filter: { path: '/login' },
            selector: {
              type: 'json',
              from: 'body',
              path: 'user_id',
            },
          },
        },
      ]
      const correlationStateMap: CorrelationStateMap = {}
      const sequentialIdGenerator = generateSequentialInt()
      const thinkTime: ThinkTime = {
        sleepType: 'iterations',
        timing: {
          type: 'fixed',
          value: 1,
        },
      }

      const expectedResult = `
        params = { headers: {}, cookies: {} }
        url = http.url\`http://test.k6.io/api/v1/foo\`
        resp = http.request('POST', url, null, params)

        params = { headers: {}, cookies: {} }
        url = http.url\`http://test.k6.io/api/v1/login\`
        resp = http.request('POST', url, null, params)
        CORRELATION_VARS[0] = resp.json().user_id

        params = { headers: {}, cookies: {} }
        url = http.url\`http://test.k6.io/api/v1/users/\${correl_0}\`
        resp = http.request('GET', url, null, params)

        params = { headers: {}, cookies: {} }
        url = http.url\`http://test.k6.io/api/v1/users\`
        resp = http.request('POST', url, \`${JSON.stringify({ user_id: '${correl_0}' })}\`, params)

      `

      expect(
        generateRequestSnippets(
          correlationRecording,
          rules,
          correlationStateMap,
          sequentialIdGenerator,
          thinkTime
        ).replace(/\s/g, '')
      ).toBe(expectedResult.replace(/\s/g, ''))
    })
  })

  describe('generateGroupSnippet', () => {
    it('should generate group snippet', () => {
      const expectedResult = `
      group('group_1', function(){});
      sleep(1)
    `

      expect(
        generateGroupSnippet('group_1', '', {
          sleepType: 'groups',
          timing: {
            type: 'fixed',
            value: 1,
          },
        }).replace(/\s/g, '')
      ).toBe(expectedResult.replace(/\s/g, ''))
    })
  })
})
