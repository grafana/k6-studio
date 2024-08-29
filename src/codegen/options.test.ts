import { describe, expect, it } from 'vitest'

import { generateOptions } from './options'
import { LoadProfileExecutorOptions, TestOptions } from '@/types/testOptions'

describe('Code generation - options', () => {
  it('should generate load profile for shared-iterations executor', () => {
    const loadProfile: LoadProfileExecutorOptions = {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 1,
    }

    const expectedResult = `{
      vus: 1,
      iterations: 1
    }`

    expect(
      generateOptions({ loadProfile } as TestOptions).replace(/\s/g, '')
    ).toBe(expectedResult.replace(/\s/g, ''))
  })

  it('should generate load profile for ramping-vus executor', () => {
    const loadProfile: LoadProfileExecutorOptions = {
      executor: 'ramping-vus',
      stages: [
        {
          duration: '1',
          target: 1,
        },
      ],
    }

    const expectedResult = `{
      stages: [
        {
          duration: '1',
          target: 1
        }
      ]
    }`

    expect(
      generateOptions({ loadProfile } as TestOptions).replace(/\s/g, '')
    ).toBe(expectedResult.replace(/\s/g, ''))
  })
})
