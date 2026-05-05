import { exhaustive } from '@/utils/typescript'

import { CheckAssertionEditor } from './CheckAssertionEditor'
import { TextAssertionEditor } from './TextAssertionEditor'
import { TextInputAssertionEditor } from './TextInputAssertionEditor'
import { VisibilityAssertionEditor } from './VisibilityAssertionEditor'
import { AssertionData } from './types'

interface AssertionEditorProps {
  assertion: AssertionData
  onCancel: () => void
  onChange: (assertion: AssertionData) => void
  onSubmit: (assertion: AssertionData) => void
}

export function AssertionEditor({ assertion, ...props }: AssertionEditorProps) {
  switch (assertion.type) {
    case 'visibility':
      return <VisibilityAssertionEditor assertion={assertion} {...props} />

    case 'text':
      return <TextAssertionEditor assertion={assertion} {...props} />

    case 'check':
      return <CheckAssertionEditor assertion={assertion} {...props} />

    case 'text-input':
      return <TextInputAssertionEditor assertion={assertion} {...props} />

    default:
      return exhaustive(assertion)
  }
}
