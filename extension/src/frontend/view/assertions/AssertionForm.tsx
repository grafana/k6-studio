import { exhaustive } from '@/utils/typescript'

import { TextAssertionForm } from './TextAssertionForm'
import { VisibilityAssertionForm } from './VisibilityAssertionForm'
import { AssertionData } from './types'

interface AssertionFormProps {
  assertion: AssertionData
  onChange: (assertion: AssertionData) => void
  onSubmit: (assertion: AssertionData) => void
}

export function AssertionForm({
  assertion,
  onChange,
  onSubmit,
}: AssertionFormProps) {
  switch (assertion.type) {
    case 'visibility':
      return (
        <VisibilityAssertionForm
          assertion={assertion}
          onChange={onChange}
          onSubmit={onSubmit}
        />
      )

    case 'text':
      return (
        <TextAssertionForm
          assertion={assertion}
          onChange={onChange}
          onSubmit={onSubmit}
        />
      )

    default:
      return exhaustive(assertion)
  }
}
