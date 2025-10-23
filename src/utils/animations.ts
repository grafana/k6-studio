import { keyframes } from '@emotion/react'

export const fadeInKeyframes = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

const scaleUpKeyframes = keyframes`
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`

export const fadeIn = `${fadeInKeyframes} 0.3s ease-out`
export const scaleUp = `${scaleUpKeyframes} 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)`
