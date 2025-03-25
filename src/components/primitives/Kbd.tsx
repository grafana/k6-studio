import styled from '@emotion/styled'

export const Kbd = styled.kbd`
  display: inline-block;
  position: relative;
  font-family: inherit;
  font-size: 0.9em;
  color: var(--gray-12);
  padding: 0.2em 0.4em;

  &::before {
    content: ' ';

    position: absolute;
    inset: 0.1em;
    border-radius: 0.2em;
    z-index: -1;

    background-color: var(--gray-1);
    box-shadow:
      inset 0 -0.05em 0.5em var(--gray-a2),
      inset 0 0.05em var(--white-a12),
      inset 0 0.25em 0.5em var(--gray-a2),
      inset 0 -0.05em var(--gray-a6),
      0 0 0 0.05em var(--gray-a5),
      0 0.08em 0.17em var(--gray-a7);
  }
`
