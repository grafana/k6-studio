import { QueryParam } from '../model/types'
import { ExtractedValue } from '../types'
import { quickHash } from './hash'

export const fromUrlEncoded = (params: QueryParam[]): ExtractedValue[] => {
  return params.map(({ value = '', ...param }) => ({
    name: param.name,
    hash: quickHash(value),
    value,
    selector: {
      type: 'param',
      name: param.name,
      value,
    },
  }))
}
