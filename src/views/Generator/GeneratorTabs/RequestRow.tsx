import { Row, RowProps } from '@/components/WebLogView'
import { useMemo } from 'react'

export function RequestRow(
  props: RowProps & { highlightedRequestIds?: string[] }
) {
  const opacity = useMemo(() => {
    if (!props.highlightedRequestIds) {
      return 1
    }

    return props.highlightedRequestIds.includes(props.data.id) ? 1 : 0.4
  }, [props.highlightedRequestIds, props.data.id])
  return (
    <Row
      {...props}
      css={{
        opacity,
        td: {
          // Match border color with hihglighted rows
          boxShadow: `inset 0 -1px var(--gray-${opacity === 1 ? 'a5' : 'a8'})`,
        },
      }}
    />
  )
}
