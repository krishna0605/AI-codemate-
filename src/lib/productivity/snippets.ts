// Snippet types for code snippets library

export interface Snippet {
  id: string;
  title: string;
  description?: string;
  language: string;
  code: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface SnippetCategory {
  name: string;
  snippets: Snippet[];
}

// Default snippets for common patterns
export const DEFAULT_SNIPPETS: Snippet[] = [
  {
    id: 'react-fc',
    title: 'React Functional Component',
    description: 'A basic React functional component with TypeScript',
    language: 'typescriptreact',
    code: `import React from 'react';

interface Props {
  // Add props here
}

export const ComponentName: React.FC<Props> = ({}) => {
  return (
    <div>
      {/* Add content here */}
    </div>
  );
};`,
    tags: ['react', 'component', 'typescript'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'react-hook',
    title: 'Custom React Hook',
    description: 'A custom React hook template',
    language: 'typescriptreact',
    code: `import { useState, useCallback, useEffect } from 'react';

export function useCustomHook() {
  const [state, setState] = useState(null);

  useEffect(() => {
    // Effect logic here
  }, []);

  const action = useCallback(() => {
    // Action logic here
  }, []);

  return { state, action };
}`,
    tags: ['react', 'hook', 'typescript'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'async-func',
    title: 'Async Function with Try-Catch',
    description: 'Async function with error handling',
    language: 'typescript',
    code: `async function fetchData(): Promise<void> {
  try {
    const response = await fetch('/api/endpoint');
    if (!response.ok) {
      throw new Error('Failed to fetch');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}`,
    tags: ['async', 'fetch', 'error-handling'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'api-route',
    title: 'Next.js API Route',
    description: 'Next.js API route handler',
    language: 'typescript',
    code: `import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Handle GET request
    return NextResponse.json({ message: 'Success' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Handle POST request
    return NextResponse.json({ message: 'Created' }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}`,
    tags: ['nextjs', 'api', 'route'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'zustand-store',
    title: 'Zustand Store',
    description: 'Simple Zustand state management store',
    language: 'typescript',
    code: `import { create } from 'zustand';

interface StoreState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export const useStore = create<StoreState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));`,
    tags: ['zustand', 'state', 'store'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

// Generate unique ID for new snippets
export function generateSnippetId(): string {
  return `snippet-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
