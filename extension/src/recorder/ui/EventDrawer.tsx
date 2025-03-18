import * as Dialog from '@radix-ui/react-dialog'
import { useContainerElement } from './ContainerProvider'
import { css, keyframes } from '@emotion/react'
import { Cross1Icon } from '@radix-ui/react-icons'

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    
    }
  to {
      transform: translateX(0);
  }
`

const slideOut = keyframes`
  from {
    transform: translateX(0);
    
    }
  to {
      transform: translateX(100%);
  }
`

interface EventDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EventDrawer({ open, onOpenChange }: EventDrawerProps) {
  const container = useContainerElement()

  return (
    <Dialog.Root modal={false} open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal container={container}>
        <Dialog.Overlay />
        <Dialog.Content
          css={css`
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            z-index: var(--layer-top-1);

            width: 35vw;
            min-width: 300px;
            padding: var(--spacing-4);
            background-color: white;
            box-shadow: var(--shadow-1);

            &[data-state='open'] {
              animation: ${slideIn} 0.3s cubic-bezier(0.22, 1, 0.36, 1);
            }

            &[data-state='closed'] {
              animation: ${slideOut} 0.3s cubic-bezier(0.22, 1, 0.36, 1);
            }

            @media (prefers-reduced-motion: reduce) {
              animation: none;
            }
          `}
          onInteractOutside={(event) => {
            event.preventDefault()
          }}
        >
          <div
            css={css`
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding-left: var(--spacing-2);
            `}
          >
            <Dialog.Title
              css={css`
                margin: 0;
              `}
            >
              Events
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close event list"
              css={css`
                background-color: transparent;
                border: none;
                padding: 0;
                cursor: pointer;
                padding: var(--spacing-2);
                border-radius: 50%;

                display: flex;
                align-items: center;
                justify-content: center;

                &:hover {
                  background-color: rgba(0, 0, 0, 0.1);
                }
              `}
            >
              <Cross1Icon />
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
