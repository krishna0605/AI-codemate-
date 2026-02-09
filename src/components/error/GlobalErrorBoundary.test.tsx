import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GlobalErrorBoundary } from './GlobalErrorBoundary';
import React from 'react';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  AlertTriangle: () => <div data-testid="alert-icon" />,
  RefreshCw: () => <div data-testid="refresh-icon" />,
  Home: () => <div data-testid="home-icon" />,
}));

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock Button
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant }: any) => (
    <button onClick={onClick} data-variant={variant}>
      {children}
    </button>
  ),
}));

const ThrowError = ({ message }: { message: string }) => {
  throw new Error(message);
};

describe('GlobalErrorBoundary', () => {
  const consoleError = console.error;

  beforeEach(() => {
    // Suppress console.error for test
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = consoleError;
    vi.clearAllMocks();
  });

  it('renders children when no error occurs', () => {
    render(
      <GlobalErrorBoundary>
        <div>Content</div>
      </GlobalErrorBoundary>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders error UI when an error occurs', () => {
    render(
      <GlobalErrorBoundary>
        <ThrowError message="Test error" />
      </GlobalErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/We apologize for the inconvenience/)).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    render(
      <GlobalErrorBoundary fallback={<div>Custom Fallback</div>}>
        <ThrowError message="Test error" />
      </GlobalErrorBoundary>
    );

    expect(screen.getByText('Custom Fallback')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });
});
