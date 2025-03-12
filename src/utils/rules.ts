import { TestRule } from '@/types/rules'

export function createEmptyRule(type: TestRule['type']): TestRule {
  switch (type) {
    case 'correlation':
      return {
        type: 'correlation',
        id: crypto.randomUUID(),
        enabled: true,
        extractor: {
          filter: { path: '' },
          selector: {
            type: 'begin-end',
            from: 'body',
            begin: '',
            end: '',
          },
          extractionMode: 'multiple',
        },
        replacer: {
          filter: { path: '' },
        },
      }
    case 'customCode':
      return {
        type: 'customCode',
        id: crypto.randomUUID(),
        enabled: true,
        filter: { path: '' },
        snippet: '',
        placement: 'before',
      }
    case 'parameterization':
      return {
        type: 'parameterization',
        id: crypto.randomUUID(),
        enabled: true,
        filter: { path: '' },
        selector: {
          type: 'begin-end',
          from: 'body',
          begin: '',
          end: '',
        },
        value: { type: 'string', value: '' },
      }
    case 'verification':
      return {
        type: 'verification',
        id: crypto.randomUUID(),
        enabled: true,
        filter: { path: '' },
        operator: 'equals',
        target: 'status',
        value: {
          type: 'recordedValue',
        },
      }
  }
}
