import styled from '@emotion/styled'
import * as RadixRadioGroup from '@radix-ui/react-radio-group'

const Root = styled(RadixRadioGroup.Root)`
  display: flex;
  gap: var(--studio-spacing-2);
  flex-direction: column;

  &[data-orientation='horizontal'] {
    flex-direction: row;
    gap: var(--studio-spacing-3);
  }
`

const Item = styled(RadixRadioGroup.Item)`
  font-weight: var(--studio-font-weight-normal);

  position: relative;
  display: flex;
  align-items: center;
  gap: var(--studio-spacing-2);

  width: 16px;
  height: 16px;
  border-radius: 100%;
  box-shadow: inset 0 0 0 1px var(--gray-a7);

  background-color: transparent;
  border: none;

  &[data-state='checked'] {
    background-color: var(--studio-accent-9);

    &:before {
      content: '';
      display: block;
      width: 7px;
      height: 7px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: white;
      border-radius: 100%;
    }
  }
`

const Indicator = styled(RadixRadioGroup.Indicator)``

export const RadioGroup = {
  Root,
  Item,
  Indicator,
}
