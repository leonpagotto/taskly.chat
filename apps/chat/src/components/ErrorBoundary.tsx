"use client";
import React from 'react';

interface State { hasError: boolean; message?: string }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: any): State {
    return { hasError: true, message: error?.message || 'Error' };
  }

  componentDidCatch(error: any, info: any) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('ErrorBoundary caught', error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
          <strong>Something went wrong.</strong>
          <div className="mt-1 opacity-80">{this.state.message}</div>
        </div>
      );
    }
    return this.props.children;
  }
}
