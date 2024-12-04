import { GroupedCorrelation } from '@/correlation'
import { ProxyData } from '@/types'
import * as Accordion from '@radix-ui/react-accordion'
import { Suggestion } from './Suggestion'

interface SuggestionListProps {
  requests: ProxyData[]
  suggestions: GroupedCorrelation[]
}

export function SuggestionList({ requests, suggestions }: SuggestionListProps) {
  return (
    <Accordion.Root type="single" collapsible>
      {suggestions.map((correlation, index) => {
        return (
          <Suggestion
            key={index}
            requests={requests}
            suggestion={correlation}
          />
        )
      })}
    </Accordion.Root>
  )
}
