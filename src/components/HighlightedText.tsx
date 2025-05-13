import { ReactNode, useMemo } from 'react'

import { Match } from '@/types/fuse'

interface MatchSegment {
  match: boolean
  text: string
  color?: Match['color']
}

function longestMatchOnly(matches: Match[]) {
  return matches.map((match) => {
    return {
      ...match,
      indices: match.indices
        .slice() // create mutable copy
        .sort((a, b) => b[1] - b[0] - (a[1] - a[0]))
        .slice(0, 1),
    }
  })
}

function splitByMatches(text: string, matches: Match[]) {
  return matches.flatMap((match) => {
    const { indices, color } = match

    const segments: MatchSegment[] = []

    let previousEnd = 0

    for (const [matchStart, matchEnd] of indices) {
      segments.push({
        match: false,
        text: text.slice(previousEnd, matchStart),
      })

      segments.push({
        match: true,
        text: text.slice(matchStart, matchEnd + 1),
        color,
      })

      previousEnd = matchEnd + 1
    }

    segments.push({
      match: false,
      text: text.slice(previousEnd),
    })

    return segments
  })
}

interface HighlightedTextProps {
  text: string
  matches: Match[] | undefined
  highlightAllMatches?: boolean
}

export function HighlightedText({
  text,
  matches,
  highlightAllMatches,
}: HighlightedTextProps) {
  const segments = useMemo(() => {
    // When searching multiple properties we need to filter matches by value we are highlighting
    const filteredMatches = (matches || []).filter(
      (match) => match.value === text
    )

    return splitByMatches(
      text,
      highlightAllMatches ? filteredMatches : longestMatchOnly(filteredMatches)
    )
  }, [text, matches, highlightAllMatches])

  if (!segments.length) {
    return <span>{text}</span>
  }

  return (
    <span>
      {segments.map((segment, index) => {
        if (segment.match) {
          return (
            <HighlightMark key={index} color={segment.color}>
              {segment.text}
            </HighlightMark>
          )
        }

        return segment.text
      })}
    </span>
  )
}

export function HighlightMark({
  children,
  className,
  color = 'accent',
}: {
  children: ReactNode
  className?: string
  color?: Match['color']
}) {
  return (
    <mark
      css={{
        color: `var(--${color}-12)`,
        backgroundColor: `var(--${color}-4)`,
        fontWeight: 700,
      }}
      className={className}
    >
      {children}
    </mark>
  )
}
