export interface K6ExportConfig {
  exports: string[]
  path: string
  defaultName?: string
  importAlias?: string
}

type K6ExportMap = { [key: string]: K6ExportConfig }

export const K6_EXPORTS: K6ExportMap = {
  k6: {
    exports: ['check', 'fail', 'group', 'randomSeed', 'sleep'],
    path: 'k6',
  },
  'k6/crypto': {
    exports: ['default'],
    defaultName: 'crypto',
    path: 'k6/crypto',
  },
  'k6/encoding': {
    exports: ['default'],
    defaultName: 'encoding',
    path: 'k6/encoding',
  },
  'k6/data': {
    exports: ['SharedArray'],
    path: 'k6/data',
  },
  'k6/execution': {
    exports: ['default'],
    defaultName: 'execution',
    path: 'k6/execution',
  },
  'k6/html': {
    exports: ['parseHTML'],
    path: 'k6/html',
  },
  'k6/http': {
    exports: ['default'],
    defaultName: 'http',
    path: 'k6/http',
  },
  'k6/net/grpc': {
    exports: ['default'],
    defaultName: 'grpc',
    path: 'k6/net/grpc',
  },
  'k6/ws': {
    exports: ['default'],
    defaultName: 'ws',
    path: 'k6/ws',
  },
  'k6/experimental/browser': {
    exports: ['browser'],
    path: 'k6/experimental/browser',
    defaultName: 'browser',
  },
}

const JSLIB: K6ExportMap = {
  'k6-utils': {
    exports: [
      'uuidv4',
      'randomIntBetween',
      'randomItem',
      'randomString',
      'findBetween',
    ],
    path: 'https://jslib.k6.io/k6-utils/1.4.0/index.js',
  },
  'k6-summary': {
    exports: ['humanizeValue', 'textSummary', 'jUnit'],
    path: 'https://jslib.k6.io/k6-summary/0.1.0/index.js',
  },
  jsonpath: {
    exports: ['default'],
    defaultName: 'jsonpath',
    path: 'https://jslib.k6.io/jsonpath/1.0.2/index.js',
  },
  formdata: {
    exports: ['FormData'],
    path: 'https://jslib.k6.io/formdata/0.0.2/index.js',
  },
  'form-urlencoded': {
    exports: ['default'],
    defaultName: 'formUrlEncoded',
    path: 'https://jslib.k6.io/form-urlencoded/3.0.0/index.js',
  },
  papaparse: {
    exports: ['default'],
    defaultName: 'Papa',
    path: 'https://jslib.k6.io/papaparse/5.1.1/index.js',
  },
  ajv: {
    exports: ['default'],
    defaultName: 'Ajv',
    path: 'https://jslib.k6.io/ajv/6.12.5/index.js',
  },
  httpx: {
    exports: ['*'],
    importAlias: 'httpdx',
    path: 'https://jslib.k6.io/httpx/0.1.0/index.js',
  },
  k6chaijs: {
    exports: ['*'],
    importAlias: 'chai',
    path: 'https://jslib.k6.io/k6chaijs/4.3.4.3/index.js',
  },
  'k6chaijs-contracts': {
    exports: ['initContractPlugin'],
    path: 'https://jslib.k6.io/k6chaijs-contracts/4.3.4.1/index.js',
  },
  url: {
    exports: ['URL', 'URLSearchParams'],
    path: 'https://jslib.k6.io/url/1.0.0/index.js',
  },
  kahwah: {
    exports: ['*'],
    path: 'https://jslib.k6.io/kahwah/0.1.6/index.js',
  },
}

export const ALL_EXPORTS = {
  ...K6_EXPORTS,
  ...JSLIB,
}
