import { isTextUIPart, UIMessage } from 'ai'

type UIPart = UIMessage['parts'][number]

export interface LogAddition {
  partKey: string
  text: string
  kind: 'text' | 'thinking'
}

export interface LogUpdate {
  entryId: string
  text: string
}

export interface LogUpdates {
  added: LogAddition[]
  updated: LogUpdate[]
}

function getPartContent(
  part: UIPart
): { text: string; kind: LogAddition['kind'] } | undefined {
  if (isTextUIPart(part) && part.text.trim()) {
    return { text: part.text, kind: 'text' }
  }

  // Streaming "thinking" content; surfacing it gives immediate feedback
  // while the assistant works out its plan.
  if (part.type === 'reasoning' && part.text.trim()) {
    return { text: part.text, kind: 'thinking' }
  }

  return undefined
}

export function deriveLogUpdates(
  messages: UIMessage[],
  seen: ReadonlyMap<string, string>
): LogUpdates {
  return messages
    .filter((message) => message.role === 'assistant')
    .flatMap((message) =>
      message.parts.flatMap((part, partIndex) => {
        const content = getPartContent(part)

        if (!content) {
          return []
        }

        return [{ partKey: `${message.id}-${partIndex}`, ...content }]
      })
    )
    .reduce<LogUpdates>(
      (acc, { partKey, text, kind }) => {
        if (seen.has(partKey)) {
          acc.updated.push({ entryId: seen.get(partKey)!, text })
        } else {
          acc.added.push({ partKey, text, kind })
        }

        return acc
      },
      { added: [], updated: [] }
    )
}
