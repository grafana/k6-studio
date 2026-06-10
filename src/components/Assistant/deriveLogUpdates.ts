import { isTextUIPart, UIMessage } from 'ai'

export interface LogAddition {
  partKey: string
  text: string
}

export interface LogUpdate {
  entryId: string
  text: string
}

export interface LogUpdates {
  added: LogAddition[]
  updated: LogUpdate[]
}

export function deriveLogUpdates(
  messages: UIMessage[],
  seen: ReadonlyMap<string, string>
): LogUpdates {
  return messages
    .filter((message) => message.role === 'assistant')
    .flatMap((message) =>
      message.parts.flatMap((part, partIndex) => {
        if (!isTextUIPart(part) || !part.text.trim()) {
          return []
        }

        const partKey = `${message.id}-${partIndex}`

        return [{ partKey, text: part.text }]
      })
    )
    .reduce<LogUpdates>(
      (acc, { partKey, text }) => {
        if (seen.has(partKey)) {
          acc.updated.push({ entryId: seen.get(partKey)!, text })
        } else {
          acc.added.push({ partKey, text })
        }

        return acc
      },
      { added: [], updated: [] }
    )
}
