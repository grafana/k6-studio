export interface AnonymousProfile {
  type: 'anonymous'
}

export interface CloudProfile {
  type: 'cloud'
  username: string
}

export type UserProfile = AnonymousProfile | CloudProfile
