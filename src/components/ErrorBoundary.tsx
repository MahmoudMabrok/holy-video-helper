
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from "@/components/ui/button";

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
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4 p-6">
            <h1 className="text-2xl font-semibold text-red-500">Something went wrong</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button onClick={this.handleReset} variant="default">
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
