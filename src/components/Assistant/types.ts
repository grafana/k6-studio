export interface ActionLogEntry {
  id: string
  timestamp: number
  type:
    | 'reasoning'
    | 'thinking'
    | 'found'
    | 'validation'
    | 'info'
    | 'outcome-success'
    | 'outcome-partial'
    | 'outcome-failure'
  text?: string
  ruleId?: string
  validationProgress?: {
    completed: number
    total: number
  }
}
