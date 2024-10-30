import { css } from '@emotion/react'

interface MatchSegment {
  match: boolean
  text: string
}

function longestMatchOnly(
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
  matches: Array<[number, number]> | undefined
}

export function HighlightedText({ text, matches }: HighlightedTextProps) {
  const segments = splitByMatches(text, longestMatchOnly(matches ?? []))

  return (
    <>
      {segments.map((segment, index) => {
        if (segment.match) {
          return (
            <mark
              key={index}
              css={css`
                color: var(--gray-11);
                background-color: var(--gray-6);
                font-weight: 700;
              `}
            >
              {segment.text}
            </mark>
          )
        }

        return segment.text
      })}
    </>
  )
}
