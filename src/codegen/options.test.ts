import { describe, expect, it } from 'vitest'

import { generateOptions } from './options'
import { LoadProfileExecutorOptions, TestOptions } from '@/types/testOptions'

describe('Code generation - options', () => {
  it('should generate load profile for shared-iterations executor', () => {
    const loadProfile: LoadProfileExecutorOptions = {
      executor: 'shared-iterations',
      startTime: '0',
      vus: 1,
      iterations: 1,
      maxDuration: '1',
    }

    const expectedResult = `{
      scenarios: {
        default: {
          executor: 'shared-iterations',
          startTime: '0',
          vus: 1,
          iterations: 1,
          maxDuration: '1'
        }
      }
    }`

    expect(
      generateOptions({ loadProfile } as TestOptions).replace(/\s/g, '')
    ).toBe(expectedResult.replace(/\s/g, ''))
  })

  it('should generate load profile for ramping-vus executor', () => {
    const loadProfile: LoadProfileExecutorOptions = {
      executor: 'ramping-vus',
      startTime: '0',
      stages: [
        {
          duration: '1',
          target: 1,
        },
      ],
      startVUs: 1,
      gracefulRampDown: '30s',
    }

    const expectedResult = `{
      scenarios: {
        default: {
          executor: 'ramping-vus',
          startTime: '0',
          stages: [
            {
              duration: '1',
              target: 1
            }
          ],
          startVUs: 1,
          gracefulRampDown: '30s'
        }
      }
    }`

    expect(
      generateOptions({ loadProfile } as TestOptions).replace(/\s/g, '')
    ).toBe(expectedResult.replace(/\s/g, ''))
  })
})
