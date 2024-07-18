import { TestRule } from '@/schemas/rules'

export const rules: TestRule[] = [
  {
    id: '0',
    type: 'customCode',
    filter: { path: '' },
    snippet: 'console.log("Hello, world!")',
    placement: 'before',
  },
  {
    type: 'correlation',
    id: '1',
    extractor: {
      filter: { path: '' },
      selector: {
        type: 'begin-end',
        from: 'body',
        begin: '<meta name=Copyright content="',
        end: '">',
      },
    },
  },
  {
    type: 'correlation',
    id: '3',
    extractor: {
      filter: { path: '' },
      selector: {
        type: 'regex',
        from: 'url',
        regex: 'grafana.com/(.*?)/',
      },
    },
  },
  {
    type: 'correlation',
    id: '2',
    extractor: {
      filter: { path: '' },
      selector: {
        type: 'begin-end',
        from: 'headers',
        begin: 'charset=',
        end: '-8',
      },
    },
  },
  {
    type: 'correlation',
    id: '4',
    extractor: {
      filter: { path: '' },
      selector: {
        type: 'json',
        from: 'body',
        path: '[0].title',
      },
    },
  },
]
