import { ExtractedValue } from '../types'
import { flatMap, filter, groupBy } from 'lodash-es'
import { quickHash } from './hash'

export const fromHtml = (document: Document): ExtractedValue[] => {
  const inputs = document.querySelectorAll('input[type=hidden]')

  // Let's ignore the complication that several inputs on a page may
  // have the same name for now. The proper way to handle this would
  // be to try and find a specific enough selector for each input.
  const byName = groupBy(inputs, (i) => i.getAttribute('name'))
  const elements = flatMap(filter(byName, (values) => values.length === 1))

  return flatMap(elements, toValue)
}

const toValue = (element: Element): ExtractedValue[] => {
  const name = element.getAttribute('name')
  const value = element.getAttribute('value')

  if (name === null || value == null) {
    return []
  }

  return [
    {
      name: name,
      hash: quickHash(value),
      value: value,
      selector: {
        type: 'css',
        rule: `input[name=${name}]`,
        attribute: 'value',
      },
    },
  ]
}
