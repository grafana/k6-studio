import { ImportModule } from '@/types/imports'

type K6ExportName =
  | 'k6'
  | 'k6/crypto'
  | 'k6/encoding'
  | 'k6/data'
  | 'k6/execution'
  | 'k6/experimental/csv'
  | 'k6/experimental/fs'
  | 'k6/html'
  | 'k6/http'
  | 'k6/net/grpc'
  | 'k6/ws'

export const K6_EXPORTS: Record<K6ExportName, ImportModule> = {
  k6: {
    path: 'k6',
    imports: {
      type: 'named',
      imports: [
        { name: 'check' },
        { name: 'fail' },
        { name: 'group' },
        { name: 'randomSeed' },
        { name: 'sleep' },
      ],
    },
  },
  'k6/crypto': {
    path: 'k6/crypto',
    default: { name: 'crypto' },
  },
  'k6/encoding': {
    path: 'k6/encoding',
    default: { name: 'encoding' },
  },
  'k6/data': {
    path: 'k6/data',
    imports: {
      type: 'named',
      imports: [{ name: 'SharedArray' }],
    },
  },
  'k6/execution': {
    path: 'k6/execution',
    default: { name: 'execution' },
  },
  'k6/experimental/csv': {
    path: 'k6/experimental/csv',
    default: { name: 'csv' },
  },
  'k6/experimental/fs': {
    path: 'k6/experimental/fs',
    default: { name: 'fs' },
  },
  'k6/html': {
    path: 'k6/html',
    imports: {
      type: 'named',
      imports: [{ name: 'parseHTML' }],
    },
  },
  'k6/http': {
    path: 'k6/http',
    default: { name: 'http' },
  },
  'k6/net/grpc': {
    path: 'k6/net/grpc',
    default: { name: 'grpc' },
  },
  'k6/ws': {
    path: 'k6/ws',
    default: { name: 'ws' },
  },
}

type JSLibName =
  | 'k6-utils'
  | 'k6-summary'
  | 'jsonpath'
  | 'formdata'
  | 'form-urlencoded'
  | 'papaparse'
  | 'ajv'
  | 'httpx'
  | 'url'

export const JSLIB: Record<JSLibName, ImportModule> = {
  'k6-utils': {
    path: 'https://jslib.k6.io/k6-utils/1.4.0/index.js',
    imports: {
      type: 'named',
      imports: [
        { name: 'uuidv4' },
        { name: 'randomIntBetween' },
        { name: 'randomItem' },
        { name: 'randomString' },
        { name: 'findBetween' },
      ],
    },
  },
  'k6-summary': {
    path: 'https://jslib.k6.io/k6-summary/0.1.0/index.js',
    imports: {
      type: 'named',
      imports: [
        { name: 'humanizeValue' },
        { name: 'textSummary' },
        { name: 'jUnit' },
      ],
    },
  },
  jsonpath: {
    path: 'https://jslib.k6.io/jsonpath/1.0.2/index.js',
    default: { name: 'jsonpath' },
  },
  formdata: {
    path: 'https://jslib.k6.io/formdata/0.0.2/index.js',
    imports: {
      type: 'named',
      imports: [{ name: 'FormData' }],
    },
  },
  'form-urlencoded': {
    path: 'https://jslib.k6.io/form-urlencoded/3.0.0/index.js',
    default: { name: 'formUrlEncoded' },
  },
  papaparse: {
    default: { name: 'Papa' },
    path: 'https://jslib.k6.io/papaparse/5.1.1/index.js',
  },
  ajv: {
    default: { name: 'Ajv' },
    path: 'https://jslib.k6.io/ajv/6.12.5/index.js',
  },
  httpx: {
    path: 'https://jslib.k6.io/httpx/0.1.0/index.js',
    imports: {
      type: 'namespace',
      alias: 'httpdx',
    },
  },
  url: {
    path: 'https://jslib.k6.io/url/1.0.0/index.js',
    imports: {
      type: 'named',
      imports: [{ name: 'URL' }],
    },
  },
}

export const ALL_EXPORTS = {
  ...K6_EXPORTS,
  ...JSLIB,
}

export const REQUIRED_IMPORTS: ImportModule[] = [
  {
    path: 'k6',
    imports: {
      type: 'named',
      imports: [{ name: 'group' }, { name: 'sleep' }, { name: 'check' }],
    },
  },
  { path: 'k6/http', default: { name: 'http' } },
  { path: 'k6/execution', default: { name: 'execution' } },
]
