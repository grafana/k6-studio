import { SearchMatch } from '@/types/fuse'
import { ReactNode, useMemo } from 'react'

interface MatchSegment {
  match: boolean
  text: string
}

function _longestMatchOnly(
  matches: Array<[number, number]>
): Array<[number, number]> {
  return matches.sort((a, b) => b[1] - b[0] - (a[1] - a[0])).slice(0, 1)
}

function splitByMatches(text: string, matches: Array<[number, number]>) {
  const segments: MatchSegment[] = []

  let previousEnd = 0

  for (const [matchStart, matchEnd] of matches) {
    segments.push({
      match: false,
      text: text.slice(previousEnd, matchStart),
    })

    segments.push({
      match: true,
      text: text.slice(matchStart, matchEnd + 1),
    })

    previousEnd = matchEnd + 1
  }

  segments.push({
    match: false,
    text: text.slice(previousEnd),
  })

  return segments
}

interface HighlightedTextProps {
  text: string
  matches: SearchMatch[] | undefined
}

export function HighlightedText({ text, matches }: HighlightedTextProps) {
  const segments = useMemo(() => {
    // When searching multiple properties we need to filter matches by value we are highlighting
    const filteredMatches = (matches || []).filter(
      (match) => match.value === text
    )

    return splitByMatches(
      text,
      // longestMatchOnly(filteredMatches.flatMap((match) => match.indices))
      filteredMatches.flatMap((match) => match.indices)
    )
  }, [text, matches])

  return (
    <span>
      {segments.map((segment, index) => {
        if (segment.match) {
          return <HighlightMark key={index}>{segment.text}</HighlightMark>
        }

        return segment.text
      })}
    </span>
  )
}

export function HighlightMark({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <mark
      css={{
        color: 'var(--accent-12)',
        backgroundColor: 'var(--accent-5)',
        fontWeight: 700,
      }}
      className={className}
    >
      {children}
    </mark>
  )
}
