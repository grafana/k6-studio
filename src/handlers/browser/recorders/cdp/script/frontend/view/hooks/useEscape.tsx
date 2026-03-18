import { DependencyList } from 'react'
import useKey from 'react-use/lib/useKey'

export function useEscape(callback: () => void, dependencies?: DependencyList) {
  useKey('Escape', callback, {}, dependencies)
}
