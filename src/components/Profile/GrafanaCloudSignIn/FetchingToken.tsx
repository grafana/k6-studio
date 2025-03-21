import { ReactNode, useEffect, useState } from 'react'

import { FetchingTokenState } from '@/types/auth'

import { LoadingMessage } from '../LoadingMessage'

function useCarousel(message: ReactNode[], interval = 10_000) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timeout = setInterval(() => {
      setIndex((index) => (index + 1) % message.length)
    }, interval)

    return () => {
      clearInterval(timeout)
    }
  }, [message.length, interval])

  return message[index] ?? ''
}

interface FetchingTokenProps {
  state: FetchingTokenState
}

export function FetchingToken({ state }: FetchingTokenProps) {
  const message = useCarousel([
    `Setting up profile for ${state.stack.name}...`,
    `Waiting for the stack to become available...`,
    'This is taking a while, hang tight...',
  ])

  return <LoadingMessage>{message}</LoadingMessage>
}
