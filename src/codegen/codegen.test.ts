import { describe, expect, it } from 'vitest'
import {
  generateScript,
  generateRequestSnippets,
  generateVariableDeclarations,
} from './codegen'
import { CorrelationStateMap } from '@/types/rules'
import { TestRule } from '@/schemas/rules'
import { generateSequentialInt } from '@/rules/utils'
import { ProxyData } from '@/types'
import { correlationRecording } from '@/test/fixtures/correlationRecording'

describe('Code generation', () => {
  describe('generateScript', () => {
    it('should generate script', () => {
      const expectedResult = `
      import { group, sleep } from 'k6'
      import http from 'k6/http'

      export const options = {}

      export default function() {
        let resp
        sleep(1)
      }
      `

      expect(
        generateScript({
          recording: {},
          rules: [],
          variables: {},
        }).replace(/\s/g, '')
      ).toBe(expectedResult.replace(/\s/g, ''))
    })
  })

  describe('generateVariableDeclarations', () => {
    it('should generate variable declarations', () => {
      const variables = {
        test: 'test',
      }

      const expectedResult = `
        const test = "test"
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

      const expectedResult = `
        resp = http.request('GET', \`/api/v1/users\`, null, {})
      `

      expect(
        generateRequestSnippets(
          recording,
          rules,
          correlationStateMap,
          sequentialIdGenerator
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

      const expectedResult = `
        resp = http.request('POST', \`http://test.k6.io/api/v1/foo\`, null, {})

        resp = http.request('POST', \`http://test.k6.io/api/v1/login\`, null, {})
        let correl_0 = resp.json().user_id

        resp = http.request('GET', \`http://test.k6.io/api/v1/users/\${correl_0}\`, null, {})

        resp = http.request('POST', \`http://test.k6.io/api/v1/users\`, \`${JSON.stringify({ user_id: '${correl_0}' })}\`, {})

      `

      expect(
        generateRequestSnippets(
          correlationRecording,
          rules,
          correlationStateMap,
          sequentialIdGenerator
        ).replace(/\s/g, '')
      ).toBe(expectedResult.replace(/\s/g, ''))
    })
  })
})
