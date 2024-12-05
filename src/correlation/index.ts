import { Exchange } from './model/types'

import {
  Correlatable,
  Correlation,
  findCorrelations as findCorrelations,
} from './correlation'
import { Selector } from './types'
import { analyze } from './analysis'
import { exhaustive } from '@/utils/typescript'
import { formatJsonPath } from '@/utils/json'

function toSelectorId(selector: Selector) {
  switch (selector.type) {
    case 'json':
      return `json:${formatJsonPath(selector.path)}`

    case 'css':
      return `css:${selector.rule}`

    case 'param':
      return `param:${selector.name}`

    case 'header':
      return `header:${selector.param}[${selector.index}]`

    case 'path':
      return `path:${selector.index}`

    case 'search':
      return `search:${selector.name}[${selector.index}]`

    default:
      return exhaustive(selector)
  }
}

function toCorrelatableId(correlatable: Correlatable) {
  return `${correlatable.index}:${toSelectorId(correlatable.value.selector)}`
}

export interface GroupedCorrelation {
  id: string
  from: Correlatable
  usages: Correlatable[]
}

const groupCorrelations = (correlations: Correlation[]) => {
  const grouped: Record<string, GroupedCorrelation> = {}

  correlations.forEach(({ from, to }) => {
    const id = toCorrelatableId(from)

    if (grouped[id] === undefined) {
      grouped[id] = { id, from, usages: [] }
    }

    grouped[id].usages.push(to)
  })

  return Object.values(grouped)
}

export const correlate = (exchanges: Exchange[]) => {
  const correlations = findCorrelations(exchanges).filter(analyze)

  return groupCorrelations(correlations)
}
