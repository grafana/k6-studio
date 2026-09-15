import { Component, ReactNode } from 'react'

interface ErrorBoundaryProps {
  name?: string
  children?: ReactNode
  onError?: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
}

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
    console.warn(
      `[k6 Studio] ${this.props.name ?? 'In-browser UI'} crashed and was removed from the page.`,
      error
    )

    this.props.onError?.()
  }

  render() {
    // Recorded pages get no fallback UI, hiding the feature is less intrusive.
    if (this.state.hasError) {
      return null
    }

    return this.props.children
  }
}
