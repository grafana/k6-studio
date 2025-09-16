import type { ReactNode } from 'react'

// This is a temporary fix for https://github.com/radix-ui/primitives/issues/2309
// TODO: remove when no longer an issue
declare module '@radix-ui/themes' {
  namespace CheckboxGroup {
    interface RootProps {
      children?: ReactNode
    }
  }
}
