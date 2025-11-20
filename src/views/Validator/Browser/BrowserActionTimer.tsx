import { useState, useEffect } from 'react'

function formatDuration(started: number, ended: number) {
  return `${((ended - started) / 1000).toFixed(1)}s`
}

interface BrowserActionTimerProps {
  started: number
  ended: Falsy<number>
}

export function BrowserActionTimer({
  started,
  ended: finalEnded,
}: BrowserActionTimerProps) {
  const [ended, setEnded] = useState(finalEnded || Date.now())

  useEffect(() => {
    if (finalEnded) {
      setEnded(finalEnded)

      return
    }

    const interval = setInterval(() => {
      setEnded(Date.now())
    }, 50)

    return () => clearInterval(interval)
  }, [finalEnded])

  return <>{formatDuration(started, ended)}</>
}
