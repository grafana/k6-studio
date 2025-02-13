import { CorrelationPreview } from './CorrelationPreview'
import { exhaustive } from '@/utils/typescript'
import { selectSelectedRule, useGeneratorStore } from '@/store/generator'
import { ParameterizationPreview } from './ParameterizationPreview'
import { ProxyData } from '@/types'

export function RulePreview({
  selectedRequest,
  onSelectRequest,
}: {
  selectedRequest: ProxyData | null
  onSelectRequest: (request: ProxyData | null) => void
}) {
  const rule = useGeneratorStore(selectSelectedRule)

  if (!rule) {
    return null
  }

  switch (rule.type) {
    case 'correlation':
      return (
        <CorrelationPreview
          rule={rule}
          selectedRequest={selectedRequest}
          onSelectRequest={onSelectRequest}
        />
      )

    case 'parameterization':
      return (
        <ParameterizationPreview
          rule={rule}
          selectedRequest={selectedRequest}
          onSelectRequest={onSelectRequest}
        />
      )

    case 'customCode':
    case 'verification':
      return null

    default:
      return exhaustive(rule)
  }
}
