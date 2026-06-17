import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /**
   * When this value changes the boundary resets itself. Pass the current route
   * (e.g. location.pathname) so navigating away from a broken page recovers the
   * app instead of staying stuck on the fallback.
   */
  resetKey?: string;
  /** Optional custom fallback renderer. */
  fallback?: (error: Error, reset: () => void) => React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches render/runtime errors anywhere in the subtree and shows a recoverable
 * fallback instead of unmounting the whole React tree (white screen of death).
 *
 * This is intentionally a class component because error boundaries can only be
 * implemented with getDerivedStateFromError / componentDidCatch.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {error: null};
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {error};
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Auto-recover when the reset key changes (e.g. the user navigated elsewhere).
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({error: null});
    }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Keep a breadcrumb in the console for production diagnostics.
    console.error("Unhandled UI error caught by ErrorBoundary:", error, info?.componentStack);
  }

  reset = () => {
    this.setState({error: null});
  };

  render() {
    const {error} = this.state;
    if (!error) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback(error, this.reset);
    }

    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg className="h-8 w-8 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div className="max-w-md">
          <h2 className="text-lg font-semibold text-gray-900">Something went wrong</h2>
          <p className="mt-1 text-sm text-gray-600">
            The page hit an unexpected error. You can retry, or reload the application.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={this.reset}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Reload application
          </button>
        </div>
      </div>
    );
  }
}
