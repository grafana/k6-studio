import { TestRule } from '@/types/rules'

export const rules: TestRule[] = [
  {
    id: '0',
    enabled: true,
    type: 'customCode',
    filter: { path: '' },
    snippet: 'console.log("Hello, world!")',
    placement: 'before',
  },
  {
    type: 'correlation',
    id: '1',
    enabled: true,
    extractor: {
      filter: { path: '' },
      selector: {
        type: 'begin-end',
        from: 'body',
        begin: '<meta name=Copyright content="',
        end: '">',
      },
      extractionMode: 'single',
    },
  },
  {
    type: 'correlation',
    id: '3',
    enabled: true,
    extractor: {
      filter: { path: '' },
      selector: {
        type: 'regex',
        from: 'url',
        regex: 'grafana.com/(.*?)/',
      },
      extractionMode: 'single',
    },
  },
  {
    type: 'correlation',
    id: '2',
    enabled: true,
    extractor: {
      filter: { path: '' },
      selector: {
        type: 'begin-end',
        from: 'headers',
        begin: 'charset=',
        end: '-8',
      },
      extractionMode: 'single',
    },
  },
  {
    type: 'correlation',
    id: '4',
    enabled: true,
    extractor: {
      filter: { path: 'api.k6.io/v3/account/me' },
      selector: {
        type: 'json',
        from: 'body',
        path: 'organizations[0].id',
      },
      extractionMode: 'single',
    },
  },
]
