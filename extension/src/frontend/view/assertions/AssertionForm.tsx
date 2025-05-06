import { exhaustive } from '@/utils/typescript'

import { TextAssertionForm } from './TextAssertionForm'
import { VisibilityAssertionForm } from './VisibilityAssertionForm'
import { AssertionData } from './types'

interface AssertionFormProps {
  assertion: AssertionData
  onChange: (assertion: AssertionData) => void
}

export function AssertionForm({ assertion, onChange }: AssertionFormProps) {
  switch (assertion.type) {
    case 'visibility':
      return (
        <VisibilityAssertionForm assertion={assertion} onChange={onChange} />
      )

    case 'text':
      return <TextAssertionForm assertion={assertion} onChange={onChange} />

    default:
      return exhaustive(assertion)
  }
}
