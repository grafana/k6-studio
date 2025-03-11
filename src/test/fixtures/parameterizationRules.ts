import { ParameterizationRule } from '@/types/rules'

export const jsonRule = {
  type: 'parameterization',
  id: '1',
  enabled: true,
  filter: { path: '' },
  selector: {
    type: 'json',
    from: 'body',
    path: 'user_id',
  },
  value: {
    type: 'string',
    value: 'TEST_ID',
  },
} satisfies ParameterizationRule

export const urlRule = {
  type: 'parameterization',
  id: '2',
  enabled: true,
  filter: { path: '' },
  selector: {
    type: 'begin-end',
    from: 'url',
    begin: 'user_id=',
    end: '&',
  },
  value: {
    type: 'string',
    value: 'TEST_ID',
  },
} satisfies ParameterizationRule

export const headerRule = {
  type: 'parameterization',
  id: '3',
  enabled: true,
  filter: { path: '' },
  selector: {
    type: 'regex',
    from: 'headers',
    regex: 'token (.+)$',
  },
  value: {
    type: 'string',
    value: 'TEST_TOKEN',
  },
} satisfies ParameterizationRule

export const customCodeReplaceProjectId = {
  type: 'parameterization',
  id: '4',
  enabled: true,
  filter: { path: '' },
  selector: {
    type: 'regex',
    from: 'url',
    regex: 'project_id=(\\d+)',
  },
  value: {
    type: 'customCode',
    code: `
      const randomInteger = Math.floor(Math.random() * 100000);
      return randomInteger;
    `,
  },
} satisfies ParameterizationRule

export const customCodeReplaceCsrf = {
  type: 'parameterization',
  id: '4',
  enabled: true,
  filter: { path: '' },
  selector: {
    type: 'regex',
    from: 'url',
    regex: 'csrf=(\\d+)',
  },
  value: {
    type: 'customCode',
    code: `
      return '123456'
    `,
  },
} satisfies ParameterizationRule

export const dataFileRule = {
  type: 'parameterization',
  id: '42',
  enabled: true,
  filter: { path: '' },
  selector: {
    type: 'regex',
    from: 'url',
    regex: 'project_id=(\\d+)',
  },
  value: {
    type: 'dataFileValue',
    fileName: 'projects.json',
    propertyName: 'id',
  },
} satisfies ParameterizationRule
