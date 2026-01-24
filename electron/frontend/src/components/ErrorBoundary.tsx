import React, { ReactNode, ReactElement } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render(): ReactElement {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100vh',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              flexDirection: 'column',
              padding: '20px',
              fontFamily: 'var(--font-sans)',
            }}
          >
            <h2 style={{ marginBottom: '10px' }}>Something went wrong</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                padding: '8px 16px',
                backgroundColor: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Try Again
            </button>
          </div>
        )
      );
    }

    return this.props.children as ReactElement;
  }
}
