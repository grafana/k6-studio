export interface Position {
  top: number
  left: number
}

export interface Bounds extends Position {
  width: number
  height: number
}

export type Tool = 'inspect' | 'assert-text'
