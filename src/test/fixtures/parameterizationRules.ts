import { ParameterizationRule } from '@/types/rules'

export const jsonRule: ParameterizationRule = {
  type: 'parameterization',
  id: '1',
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
}

export const urlRule: ParameterizationRule = {
  type: 'parameterization',
  id: '2',
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
}

export const headerRule: ParameterizationRule = {
  type: 'parameterization',
  id: '3',
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
}
