import { describe, it, expect } from 'vitest'

import { shouldSkipCookie } from './skipCookies'

describe('shouldSkipCookie', () => {
  it('should skip AWSALB', () => {
    expect(shouldSkipCookie('AWSALB')).toBe(true)
  })

  it('should skip AWSALBCORS', () => {
    expect(shouldSkipCookie('AWSALBCORS')).toBe(true)
  })

  it('should skip JSESSIONID', () => {
    expect(shouldSkipCookie('JSESSIONID')).toBe(true)
  })

  it('should skip PHPSESSID', () => {
    expect(shouldSkipCookie('PHPSESSID')).toBe(true)
  })

  it('should match case-insensitively', () => {
    expect(shouldSkipCookie('awsalb')).toBe(true)
    expect(shouldSkipCookie('Awsalb')).toBe(true)
  })

  it('should skip prefix-matched cookies', () => {
    expect(shouldSkipCookie('incap_ses_123_456')).toBe(true)
    expect(shouldSkipCookie('visid_incap_789')).toBe(true)
    expect(shouldSkipCookie('ts01abc')).toBe(true)
    expect(shouldSkipCookie('BIGipServerpool_name')).toBe(true)
  })

  it('should not skip functional cookies', () => {
    expect(shouldSkipCookie('csrf_token')).toBe(false)
    expect(shouldSkipCookie('qp_user_token')).toBe(false)
    expect(shouldSkipCookie('session_id')).toBe(false)
    expect(shouldSkipCookie('auth_token')).toBe(false)
  })
})
