import styled from '@emotion/styled'
import { Separator as SeparatorPrimitive } from 'react-resizable-panels'

export const Separator = styled(SeparatorPrimitive)`
  --separator-size: 1px;

  position: relative;
  z-index: 2;

  &::before {
    content: '';
    display: block;
    position: absolute;
    background-color: var(--gray-5);
    transition:
      background-color 0.1s ease-out 0.2s,
      width 0.1s ease-out 0.2s,
      height 0.1s ease-out 0.2s;
    width: 100%;
    height: 100%;
  }

  &[data-separator='hover']:not([data-disabled])::before,
  &[data-separator='active']:not([data-disabled])::before {
    --separator-size: 2px;
    background-color: var(--accent-9);
  }

  &[aria-orientation='vertical']::before {
    width: var(--separator-size);
    left: calc(50% - var(--separator-size) / 2);
  }

  &[aria-orientation='horizontal']::before {
    height: var(--separator-size);
    top: calc(50% - var(--separator-size) / 2);
  }
`

export {
  Group,
  Panel,
  useDefaultLayout,
  usePanelCallbackRef,
  usePanelRef,
} from 'react-resizable-panels'
