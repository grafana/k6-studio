import { keyframes } from '@emotion/react'
import styled from '@emotion/styled'
import * as RadixToast from '@radix-ui/react-toast'

const hide = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`

const slideIn = keyframes`
  from {
    transform: translateX(calc(100% + var(--viewport-padding)));
  }
  to {
    transform: translateX(0);
  }
`

const swipeOut = keyframes`
  from {
    transform: translateX(var(--radix-toast-swipe-end-x));
  }
  to {
    transform: translateX(calc(100% + var(--viewport-padding)));
  }
`

export const ToastRoot = styled(RadixToast.Root)`
  background: var(--color-background);
  border-radius: var(--radius-3);
  box-shadow: var(--shadow-5);
  padding: var(--space-4);
  align-items: center;
  position: relative;
  display: flex;
  gap: var(--space-2);

  &[data-state='open'] {
    animation: ${slideIn} 150ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  &[data-state='closed'] {
    animation: ${hide} 100ms ease-in;
  }

  &[data-state='move'] {
    transform: translateX(var(--radix-toast-swipe-move-x));
  }

  &[data-state='cancel'] {
    transform: translateX(0);
    transition: transform 200ms ease-out;
  }

  &[data-state='end'] {
    animation: ${swipeOut} 100ms ease-out;
  }

  &:hover .close-button {
    display: inline-flex;
  }
`

export const ToastViewport = styled(RadixToast.Viewport)`
  --viewport-padding: var(--space-6);
  position: fixed;
  bottom: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  padding: var(--viewport-padding);
  gap: var(--space-2);
  width: 390px;
  max-width: 100vw;
  margin: 0;
  list-style: none;
  z-index: 40;
  outline: none;
`

export const ToastTitle = styled(RadixToast.Title)`
  font-weight: 500;
  font-size: 15px;
`

export const ToastDescription = styled(RadixToast.Description)`
  margin-top: var(--space-1);
  color: var(--slate-11);
  font-size: 13px;
  line-height: 1.3;
`

export const ToastAction = styled(RadixToast.Action)``

export const ToastClose = styled(RadixToast.Close)`
  position: absolute;
  top: -6px;
  left: -6px;
  background-color: var(--color-background);
  width: 17px;
  height: 17px;
  display: none;

  .lucide {
    width: 12px;
    height: 12px;
  }
`

export const ToastIcon = styled.div`
  flex-shrink: 0;
  height: 24px;

  .lucide {
    width: 24px;
    height: 24px;
  }
`
