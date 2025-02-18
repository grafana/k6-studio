export interface AnonymousProfile {
  type: 'anonymous'
}

export interface CloudProfile {
  type: 'cloud'
  email: string
}

export type UserProfile = AnonymousProfile | CloudProfile
