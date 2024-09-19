import type { MutableRefObject, Ref } from 'react'

export function mergeRefs<T>(...refs: Array<Ref<T>>) {
  return (value: T) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value)
      } else if (ref !== null) {
        const mutableRef = ref as MutableRefObject<T>

        mutableRef.current = value
      }
    })
  }
}
