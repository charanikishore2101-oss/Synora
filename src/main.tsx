import { StrictMode, Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in LUMA:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#0a0b10',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          textAlign: 'center',
          fontFamily: 'sans-serif'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>Something went wrong loading LUMA</h2>
          <p style={{ color: '#9ca3af', marginBottom: '20px', maxWidth: '500px' }}>
            {this.state.error?.message || 'An unexpected error occurred while initializing the start page.'}
          </p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#8b5cf6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Reset Storage & Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
