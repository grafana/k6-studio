import styled from '@emotion/styled'
import * as Primitives from 'react-resizable-panels'

export const PanelGroup = styled(Primitives.PanelGroup)`
  --separator-border: 1px solid var(--gray-5);
  --separator-size: 6px;

  &[data-panel-group-direction='horizontal'] [data-panel] {
    border-right: var(--separator-border);

    margin: 0 calc(var(--separator-size) / 2 * -1);

    &:first-child,
    &[data-panel-size='0.0'] {
      margin-left: 0;
    }

    &:last-child,
    &[data-panel-size='0.0'] {
      border-right: none;
      margin-right: 0;
    }

    &[data-panel-size='0.0'] {
      margin: 0;
    }
  }

  &[data-panel-group-direction='vertical'] [data-panel] {
    border-bottom: var(--separator-border);

    margin: calc(var(--separator-size) / 2 * -1) 0;

    :first-child {
      margin-top: 0;
    }

    &:last-child,
    &[data-panel-size='0.0'] {
      border-bottom: none;
    }

    &[data-panel-size='0.0'] {
      margin: 0;
    }
  }
`

export const Panel = styled(Primitives.Panel)`
  margin: calc(var(--separator-size) / 2 * -1);
`

export const PanelResizeHandle = styled(Primitives.PanelResizeHandle)`
  position: relative;

  &:before {
    display: block;
    content: '';
    position: absolute;
    background-color: transparent;
    transition: background-color 0.2s 0.2s;
  }

  &[data-resize-handle-state]:not([data-resize-handle-state='inactive']) {
    z-index: 9998;

    &:before {
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: var(--accent-9);
    }

    &[data-panel-group-direction='horizontal']:before {
      width: 2px;
    }

    &[data-panel-group-direction='vertical']:before {
      height: 2px;
    }
  }

  &[data-panel-group-direction='horizontal'] {
    width: var(--separator-size);

    &:before {
      width: 0px;
    }
  }

  &[data-panel-group-direction='vertical'] {
    height: var(--separator-size);

    &:before {
      height: 0px;
    }
  }
`

export type {
  ImperativePanelGroupHandle,
  ImperativePanelHandle,
} from 'react-resizable-panels'
