import { Component, ReactNode } from 'react'

interface ErrorBoundaryProps {
  name?: string
  children?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

/**
 * Keeps a crashing feature from taking down the rest of the in-browser UI.
 * Recorded pages can break our components in ways we don't control, e.g. by
 * replacing built-ins that our dependencies rely on.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return {
      hasError: true,
    }
  }

  componentDidCatch(error: Error) {
    // This lands in the recorded page's console, so it's logged as a warning
    // to avoid it being mistaken for a failure of the page itself. It is also
    // the ONLY record of the crash: the render root in view/index.tsx mutes
    // React's own error logging (onCaughtError) on the assumption that this
    // warning exists.
    console.warn(
      `[k6 Studio] ${this.props.name ?? 'In-browser UI'} crashed and was removed from the page.`,
      error
    )
  }

  render() {
    // Recorded pages get no fallback UI, hiding the feature is less intrusive.
    if (this.state.hasError) {
      return null
    }

    return this.props.children
  }
}
