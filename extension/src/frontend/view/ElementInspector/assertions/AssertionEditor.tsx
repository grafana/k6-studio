import { exhaustive } from '@/utils/typescript'

import { TextAssertionEditor } from './TextAssertionEditor'
import { VisibilityAssertionEditor } from './VisibilityAssertionEditor'
import { AssertionData } from './types'

interface AssertionEditorProps {
  assertion: AssertionData
  onChange: (assertion: AssertionData) => void
  onSubmit: (assertion: AssertionData) => void
}

export function AssertionEditor({
  assertion,
  onChange,
  onSubmit,
}: AssertionEditorProps) {
  switch (assertion.type) {
    case 'visibility':
      return (
        <VisibilityAssertionEditor
          assertion={assertion}
          onChange={onChange}
          onSubmit={onSubmit}
        />
      )

    case 'text':
      return (
        <TextAssertionEditor
          assertion={assertion}
          onChange={onChange}
          onSubmit={onSubmit}
        />
      )

    default:
      return exhaustive(assertion)
  }
}
