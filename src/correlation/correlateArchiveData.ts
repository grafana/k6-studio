import { fromHAR } from './model'
import { correlate as correlateModel } from './index'
import type { Har } from 'har-format'

export function correlate(har: Har) {
  return correlateModel(fromHAR(har))
}
