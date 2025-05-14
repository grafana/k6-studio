import { exhaustive } from '@/utils/typescript'

import { TextAssertionEditor } from './TextAssertionEditor'
import { VisibilityAssertionEditor } from './VisibilityAssertionEditor'
import { AssertionData } from './types'

interface AssertionEditorProps {
  assertion: AssertionData
  onCancel: () => void
  onChange: (assertion: AssertionData) => void
  onSubmit: (assertion: AssertionData) => void
}

export function AssertionEditor({
  assertion,
  onCancel,
  onChange,
  onSubmit,
}: AssertionEditorProps) {
  switch (assertion.type) {
    case 'visibility':
      return (
        <VisibilityAssertionEditor
          assertion={assertion}
          onCancel={onCancel}
          onChange={onChange}
          onSubmit={onSubmit}
        />
      )

    case 'text':
      return (
        <TextAssertionEditor
          assertion={assertion}
          onCancel={onCancel}
          onChange={onChange}
          onSubmit={onSubmit}
        />
      )

    default:
      return exhaustive(assertion)
  }
}
