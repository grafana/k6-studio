import { TestRule } from '@/types/rules'

export function createEmptyRule(type: TestRule['type']): TestRule {
  switch (type) {
    case 'correlation':
      return {
        type: 'correlation',
        id: self.crypto.randomUUID(),
        extractor: {
          filter: { path: '' },
          selector: {
            type: 'begin-end',
            from: 'body',
            begin: '',
            end: '',
          },
        },
      }
    case 'customCode':
      return {
        type: 'customCode',
        id: self.crypto.randomUUID(),
        filter: { path: '' },
        snippet: '',
        placement: 'before',
      }
    case 'parameterization':
      return {
        type: 'parameterization',
        id: self.crypto.randomUUID(),
        filter: { path: '' },
        selector: {
          type: 'begin-end',
          from: 'body',
          begin: '',
          end: '',
        },
        value: { type: 'variable', variableName: '' },
      }
    case 'verification':
      return {
        type: 'verification',
        id: self.crypto.randomUUID(),
        filter: { path: '' },
        selector: {
          type: 'begin-end',
          from: 'body',
          begin: '',
          end: '',
        },
        value: {
          type: 'recordedValue',
        },
      }
    case 'recording-verification':
      return {
        type: 'recording-verification',
        id: self.crypto.randomUUID(),
      }
  }
}
