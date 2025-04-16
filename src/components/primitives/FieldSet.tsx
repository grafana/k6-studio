import styled from '@emotion/styled'

export const FieldSet = styled.fieldset`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--studio-spacing-2);
  align-items: center;

  border: none;
  padding: 0;

  & > .studio-text-field {
    display: grid;
    grid-column: span 2;
    grid-template-columns: subgrid;
  }
`
