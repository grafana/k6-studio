import { atom } from 'jotai'

export type GeneratorTab = 'requests' | 'script' | 'rule-preview'

export const selectedRequestAtom = atom<string | null>(null)

export const currentTab = atom<GeneratorTab>('requests')
