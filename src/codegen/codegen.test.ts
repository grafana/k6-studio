import { describe, expect, it } from 'vitest'
import {
  generateScript,
  generateRequestSnippets,
  generateVariableDeclarations,
} from './codegen'
import { TestRule, CorrelationStateMap } from '@/types/rules'
import { generateSequentialInt } from '@/rules/utils'
import { ProxyData } from '@/types'

describe('Code generation', () => {
  describe('generateScript', () => {
    it('should generate script', () => {
      const expectedResult = `
      import { group, sleep } from 'k6'
      import http from 'k6/http'

      export const options = {}

      export default function() {
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
        http.request('GET', '/api/v1/users', null, {})
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
  })
})
