import { BrowserEvent } from '@/schemas/recording'

export interface BrowserScenario {
  type: 'browser'
  events: BrowserEvent[]
}

export interface HttpScenario {
  type: 'http'
  requests: []
}

export type Scenario = BrowserScenario | HttpScenario
export type DefaultScenario = Scenario & {
  name?: string
}

export interface Test {
  defaultScenario?: DefaultScenario
  scenarios: Record<string, Scenario>
}
