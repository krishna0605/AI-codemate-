// Project template types and default templates

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'frontend' | 'backend' | 'fullstack' | 'library';
  framework: string;
  files: TemplateFile[];
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export interface TemplateFile {
  path: string;
  content: string;
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'react-vite',
    name: 'React + Vite',
    description: 'Modern React app with Vite, TypeScript, and ESLint',
    icon: 'deployed_code',
    category: 'frontend',
    framework: 'React',
    files: [
      {
        path: 'src/App.tsx',
        content: `import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <h1>React + Vite</h1>
      <div className="card">
        <button onClick={() => setCount(c => c + 1)}>
          count is {count}
        </button>
      </div>
    </div>
  )
}

export default App`,
      },
      {
        path: 'src/main.tsx',
        content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
      },
      {
        path: 'src/App.css',
        content: `.app {
  text-align: center;
  padding: 2rem;
}

.card {
  padding: 2rem;
}

button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
}`,
      },
      {
        path: 'src/index.css',
        content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
}`,
      },
    ],
    dependencies: {
      react: '^18.2.0',
      'react-dom': '^18.2.0',
    },
    devDependencies: {
      '@types/react': '^18.2.0',
      '@types/react-dom': '^18.2.0',
      '@vitejs/plugin-react': '^4.0.0',
      typescript: '^5.0.0',
      vite: '^5.0.0',
    },
  },
  {
    id: 'nextjs-app',
    name: 'Next.js App',
    description: 'Next.js 14 with App Router, TypeScript, and Tailwind',
    icon: 'rocket_launch',
    category: 'fullstack',
    framework: 'Next.js',
    files: [
      {
        path: 'app/page.tsx',
        content: `export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold">Welcome to Next.js</h1>
      <p className="mt-4 text-gray-600">
        Get started by editing app/page.tsx
      </p>
    </main>
  )
}`,
      },
      {
        path: 'app/layout.tsx',
        content: `import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Next.js App',
  description: 'Created with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`,
      },
      {
        path: 'app/globals.css',
        content: `@tailwind base;
@tailwind components;
@tailwind utilities;`,
      },
    ],
    dependencies: {
      next: '^14.0.0',
      react: '^18.2.0',
      'react-dom': '^18.2.0',
    },
    devDependencies: {
      '@types/node': '^20.0.0',
      '@types/react': '^18.2.0',
      autoprefixer: '^10.4.0',
      postcss: '^8.4.0',
      tailwindcss: '^3.3.0',
      typescript: '^5.0.0',
    },
  },
  {
    id: 'express-api',
    name: 'Express API',
    description: 'Express.js REST API with TypeScript and validation',
    icon: 'api',
    category: 'backend',
    framework: 'Express',
    files: [
      {
        path: 'src/index.ts',
        content: `import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/users', (req, res) => {
  res.json([
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
  ]);
});

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});`,
      },
      {
        path: 'src/types.ts',
        content: `export interface User {
  id: number;
  name: string;
  email?: string;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}`,
      },
    ],
    dependencies: {
      express: '^4.18.0',
      cors: '^2.8.0',
    },
    devDependencies: {
      '@types/express': '^4.17.0',
      '@types/cors': '^2.8.0',
      '@types/node': '^20.0.0',
      typescript: '^5.0.0',
      'ts-node': '^10.9.0',
      nodemon: '^3.0.0',
    },
  },
  {
    id: 'npm-package',
    name: 'NPM Package',
    description: 'TypeScript library ready for NPM publishing',
    icon: 'package_2',
    category: 'library',
    framework: 'TypeScript',
    files: [
      {
        path: 'src/index.ts',
        content: `/**
 * Add two numbers together
 */
export function add(a: number, b: number): number {
  return a + b;
}

/**
 * Subtract b from a
 */
export function subtract(a: number, b: number): number {
  return a - b;
}

/**
 * Multiply two numbers
 */
export function multiply(a: number, b: number): number {
  return a * b;
}

/**
 * Divide a by b
 */
export function divide(a: number, b: number): number {
  if (b === 0) throw new Error('Cannot divide by zero');
  return a / b;
}`,
      },
      {
        path: 'src/types.ts',
        content: `export type MathOperation = 'add' | 'subtract' | 'multiply' | 'divide';

export interface CalculatorResult {
  operation: MathOperation;
  operands: [number, number];
  result: number;
}`,
      },
    ],
    devDependencies: {
      typescript: '^5.0.0',
      tsup: '^8.0.0',
      vitest: '^1.0.0',
    },
  },
];
