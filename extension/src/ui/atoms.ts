import { atom } from 'jotai'
import { Tool } from './types'

export const tool = atom<Tool | null>(null)
