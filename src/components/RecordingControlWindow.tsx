import { css } from '@emotion/react'
import { StopIcon } from '@radix-ui/react-icons'
import { Button, Heading } from '@radix-ui/themes'
import { BrowserWindowConstructorOptions } from 'electron'

import { stopRecording } from '@/views/Recorder/Recorder.utils'

import { SubWindow } from './SubWindow'

interface RecordingControlWindowProps {
  isOpen: boolean
}

const windowOptions: BrowserWindowConstructorOptions = {
  width: 380,
  height: 88,
  alwaysOnTop: true,
  resizable: false,
  fullscreenable: false,
  minimizable: false,
  maximizable: false,
  frame: false,
  title: 'Recording toolbar',
}

export function RecordingControlWindow({
  isOpen,
}: RecordingControlWindowProps) {
  if (!isOpen) {
    return null
  }

  const handleStopRecording = () => {
    stopRecording()
  }

  return (
    <SubWindow options={windowOptions}>
      <div
        css={css`
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 8px;
          user-select: none;
        `}
      >
        <Heading
          css={css`
            margin: 0;
            font-size: 16px;
            font-weight: 500;
            app-region: drag;
          `}
        >
          You{"'"}re recording with Grafana k6 Studio
        </Heading>
        <Button
          onClick={handleStopRecording}
          css={css`
            display: flex;
            gap: 8px;
            width: 100%;
            justify-content: center;
            align-items: center;
          `}
        >
          <StopIcon /> Stop recording
        </Button>
        <div
          css={css`
            font-size: 10px;
          `}
        >
          Your interactions in the browser will be recorded until you stop the
          recording
        </div>
      </div>
    </SubWindow>
  )
}
