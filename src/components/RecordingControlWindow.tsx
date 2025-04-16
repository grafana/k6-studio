import { css } from '@emotion/react'
import {
  DragHandleDots2Icon,
  MinusCircledIcon,
  StopIcon,
} from '@radix-ui/react-icons'
import { BrowserWindowConstructorOptions } from 'electron'
import { useEffect, useState } from 'react'

import { stopRecording } from '@/views/Recorder/Recorder.utils'
import { RecorderState } from '@/views/Recorder/types'

import { SubWindow } from './SubWindow'
import { Button } from './primitives/Button'

interface RecordingControlWindowProps {
  state: RecorderState
}

const windowOptions: BrowserWindowConstructorOptions = {
  width: 320,
  height: 32,
  alwaysOnTop: true,
  resizable: false,
  fullscreenable: false,
  minimizable: false,
  maximizable: false,
  frame: false,
  title: 'Recording toolbar',
  useContentSize: true,
}

export function RecordingControlWindow({ state }: RecordingControlWindowProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleStopRecording = () => {
    stopRecording()
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  useEffect(() => {
    console.log('RecordingControlWindow state', state)
    setIsOpen(state === 'recording')
  }, [state])

  if (!isOpen) {
    return null
  }

  return (
    <SubWindow options={windowOptions} onClose={handleClose}>
      <div
        css={css`
          box-sizing: border-box;
          height: 100%;
          display: flex;
          align-items: center;
          user-select: none;
          gap: 8px;
          padding: 4px 8px;
        `}
      >
        <div
          css={css`
            app-region: drag;
            font-size: var(--studio-font-size-1);

            &:before {
              content: '';
              display: inline-block;
              width: 8px;
              height: 8px;
              margin-right: 4px;
              background-color: #f00;
              border-radius: 50%;
              animation: pulse 2s ease-in-out infinite;

              @keyframes pulse {
                0% {
                  transform: scale(1);
                  opacity: 1;
                }
                50% {
                  transform: scale(1.2);
                  opacity: 0.5;
                }
                100% {
                  transform: scale(1);
                  opacity: 1;
                }
              }
            }
          `}
        >
          Recording
        </div>
        <Button size="1" onClick={handleStopRecording}>
          <StopIcon /> Stop
        </Button>
        <Button size="1" onClick={handleClose}>
          <MinusCircledIcon /> Close
        </Button>
        <div
          css={css`
            app-region: drag;
            display: flex;
            justify-content: flex-end;
            flex-grow: 1;
          `}
        >
          <DragHandleDots2Icon />
        </div>
      </div>
    </SubWindow>
  )
}
