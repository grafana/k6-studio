import { afterEach, describe, expect, it, vi } from 'vitest'
import { generateScript, generateRequestSnippets } from './codegen'
import { TestRule } from '@/types/rules'
import { ProxyData } from '@/types'

describe('Code generation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('generateScript', () => {
    vi.mock('fs-extra', async () => {
      const codegen = await vi.importActual('./codegen')

      return {
        ...codegen,
        generateOptions: vi.fn(() => '{}'),
        generateVUCode: vi.fn(() => ''),
      }
    })

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
