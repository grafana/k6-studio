import { K6Log } from '@/types'

export function createK6Log(log?: Partial<K6Log>): K6Log {
  return {
    error: '',
    msg: 'Log',
    level: 'info',
    source: 'source',
    time: '00:00:00',
    ...log,
  }
}
