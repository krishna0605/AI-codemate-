'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class EditorErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Editor component error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-4 bg-muted/30 text-center border-2 border-dashed border-destructive/20 rounded-lg m-2">
          <AlertCircle className="h-10 w-10 text-destructive mb-3" />
          <h3 className="text-lg font-semibold mb-1">Editor Error</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-xs">
            The code editor encountered an unexpected error and could not be loaded.
          </p>
          <Button onClick={this.handleReset} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-3 w-3" />
            Reload Editor
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
