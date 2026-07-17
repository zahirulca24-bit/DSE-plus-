import React, { ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in DSE Pulse App:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-bg-dark text-text-primary flex flex-col items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-surface-dark border border-border-dark p-6 rounded-md text-center">
            <div className="inline-flex p-3 bg-neg/10 border border-neg/20 text-neg rounded-full mb-4">
              <AlertOctagon className="w-8 h-8" />
            </div>
            
            <h2 className="text-lg font-medium text-text-primary mb-2">
              Terminal Render Error
            </h2>
            
            <p className="text-xs font-mono text-text-secondary bg-[#0c101f] p-3 rounded border border-border-dark text-left overflow-auto max-h-40 mb-5">
              {this.state.error?.toString() || 'Unknown terminal crash'}
            </p>

            <button
              onClick={this.handleReset}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-blue-600 text-white font-medium rounded text-sm transition-all duration-150 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Terminal Session
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
