import { describe, expect, it } from 'vitest'
import { generateScript, generateRequestSnippets } from './codegen'
import { TestRule } from '@/types/rules'
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

      expect(generateScript({}, []).replace(/\s/g, '')).toBe(
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

      const expectedResult = `
        http.request('GET', '/api/v1/users', null, {})
      `

      expect(generateRequestSnippets(recording, rules).replace(/\s/g, '')).toBe(
        expectedResult.replace(/\s/g, '')
      )
    })
  })
})
