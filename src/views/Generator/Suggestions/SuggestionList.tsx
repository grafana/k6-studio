import { GroupedCorrelation } from '@/correlation'
import { ProxyData } from '@/types'
import * as Accordion from '@radix-ui/react-accordion'
import { Suggestion } from './Suggestion'
import { useGeneratorStore } from '@/store/generator'
import { CorrelationExtractor, TestRule } from '@/types/rules'
import { formatJsonPath } from '@/utils/json'
import { Selector } from '@/correlation/types'

function convertSelectorToExtractor(
  request: ProxyData,
  selector: Selector
): CorrelationExtractor {
  switch (selector.type) {
    case 'json':
      return {
        filter: {
          path: request.request.path,
        },
        selector: {
          type: 'json',
          from: 'body',
          path: formatJsonPath(selector.path),
        },
      }

    default:
      throw new Error('Can only extract from JSON bodies for now.')
  }
}

function convertSuggestionToRule(
  request: ProxyData,
  suggestion: GroupedCorrelation
): TestRule {
  return {
    type: 'correlation',
    id: crypto.randomUUID(),
    extractor: convertSelectorToExtractor(
      request,
      suggestion.from.value.selector
    ),
  }
}

interface SuggestionListProps {
  requests: ProxyData[]
  suggestions: GroupedCorrelation[]
}

export function SuggestionList({ requests, suggestions }: SuggestionListProps) {
  const addRule = useGeneratorStore((state) => state.addRule)
  const setSelectedRuleId = useGeneratorStore(
    (state) => state.setSelectedRuleId
  )

  function handleApplySuggestion(suggestion: GroupedCorrelation) {
    const request = requests[suggestion.from.index]

    if (request === undefined) {
      throw new Error('Request not found')
    }

    const rule = convertSuggestionToRule(request, suggestion)

    addRule(rule)
    setSelectedRuleId(rule.id)
  }

  return (
    <Accordion.Root type="multiple">
      {suggestions.map((correlation, index) => {
        return (
          <Suggestion
            key={index}
            requests={requests}
            suggestion={correlation}
            onApply={handleApplySuggestion}
          />
        )
      })}
    </Accordion.Root>
  )
}
