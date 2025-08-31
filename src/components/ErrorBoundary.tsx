import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error)
    console.error('Error info:', errorInfo)
    console.error('Component stack:', errorInfo.componentStack)
    this.setState({ error, errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-red-800 font-semibold mb-2">Something went wrong</h2>
          <div className="text-red-600 text-sm mb-4">
            {this.state.error?.message || 'Unknown error'}
          </div>
          <details className="text-xs text-red-500">
            <summary>Technical Details</summary>
            <pre className="mt-2 whitespace-pre-wrap">
              {this.state.error?.stack}
            </pre>
            <pre className="mt-2 whitespace-pre-wrap">
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary