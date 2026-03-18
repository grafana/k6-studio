import { describe, expect, it } from 'vitest'

import {
  generateCodeChallenge,
  generateCodeVerifier,
  generateState,
} from './pkce'

describe('generateCodeVerifier', () => {
  it('returns a base64url string', () => {
    const verifier = generateCodeVerifier()
    expect(verifier).toMatch(/^[A-Za-z0-9\-_]+$/)
  })

  it('returns 43 characters (32 bytes in base64url)', () => {
    const verifier = generateCodeVerifier()
    // 32 bytes → 43 base64url chars
    expect(verifier.length).toBe(43)
  })

  it('returns a different value each call', () => {
    const a = generateCodeVerifier()
    const b = generateCodeVerifier()
    expect(a).not.toBe(b)
  })
})

describe('generateCodeChallenge', () => {
  it('returns a base64url string', () => {
    const challenge = generateCodeChallenge('test-verifier')
    expect(challenge).toMatch(/^[A-Za-z0-9\-_]+$/)
  })

  it('is deterministic for the same verifier', () => {
    const verifier = 'fixed-verifier-value'
    expect(generateCodeChallenge(verifier)).toBe(
      generateCodeChallenge(verifier)
    )
  })

  it('produces different challenges for different verifiers', () => {
    const a = generateCodeChallenge('verifier-a')
    const b = generateCodeChallenge('verifier-b')
    expect(a).not.toBe(b)
  })

  it('produces the correct SHA-256 hash for a known verifier', () => {
    // echo -n "abc" | openssl dgst -sha256 -binary | base64 | tr '+/' '-_' | tr -d '='
    // SHA-256("abc") = ungWv48Bz-pBQUDeXa4iI7ADYaOWF3qctBD_YfIAFa0
    expect(generateCodeChallenge('abc')).toBe(
      'ungWv48Bz-pBQUDeXa4iI7ADYaOWF3qctBD_YfIAFa0'
    )
  })
})

describe('generateState', () => {
  it('returns a hex string', () => {
    const state = generateState()
    expect(state).toMatch(/^[0-9a-f]+$/)
  })

  it('returns 64 characters (32 bytes as hex)', () => {
    const state = generateState()
    expect(state.length).toBe(64)
  })

  it('returns a different value each call', () => {
    const a = generateState()
    const b = generateState()
    expect(a).not.toBe(b)
  })
})
