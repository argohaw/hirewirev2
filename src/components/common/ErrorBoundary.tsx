import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'An unexpected rendering error occurred.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('HireWire error boundary', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-xl px-6 py-24 text-center">
          <p className="font-display text-3xl text-[var(--hw-gold)]">Signal lost</p>
          <p className="mt-3 text-sm text-[var(--fg-muted)]">{this.state.message}</p>
          <button
            type="button"
            className="mt-6 rounded-full bg-[var(--hw-gold)] px-5 py-2 text-sm font-semibold text-[var(--hw-black)]"
            onClick={() => window.location.reload()}
          >
            Reload HireWire
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
