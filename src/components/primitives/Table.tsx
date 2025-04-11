import styled from '@emotion/styled'
import { ComponentProps, forwardRef } from 'react'

type RootProps = ComponentProps<'table'> & {
  size?: 'compact' | 'normal'
}

const RootBase = forwardRef<HTMLTableElement, RootProps>(function Root(
  { size = 'normal', ...props },
  ref
) {
  return <table ref={ref} {...props} data-size={size} />
})

const Root = styled(RootBase)`
  font-size: var(--studio-font-size-2);
  border-collapse: collapse;

  &[data-size='compact'] {
    font-size: var(--studio-font-size-1);
  }
`

const Head = styled.thead``
const Body = styled.tbody``

const Row = styled.tr`
  border-top: 1px solid var(--studio-border-color);

  &:first-child {
    border-top: none;
  }
`

const Header = styled.th``

const Cell = styled.td`
  padding: var(--studio-spacing-2);
`

export const Table = {
  Root,
  Row,
  Header,
  Cell,
  Head,
  Body,
}
