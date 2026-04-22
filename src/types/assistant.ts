export type AssistantErrorCategory =
  | 'auth-expired'
  | 'quota-exceeded'
  | 'network'
  | 'unknown'

export interface AssistantErrorInfo {
  category: AssistantErrorCategory
  message: string
}
