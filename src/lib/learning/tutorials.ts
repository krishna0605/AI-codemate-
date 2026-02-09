// Tutorial types and default tutorials

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  code?: string;
  language?: string;
  hint?: string;
  validation?: {
    type: 'contains' | 'exact' | 'regex';
    value: string;
  };
  highlightLines?: number[];
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string; // e.g., "15 min"
  category: string;
  steps: TutorialStep[];
  prerequisites?: string[];
}

export const TUTORIALS: Tutorial[] = [
  {
    id: 'react-basics',
    title: 'React Fundamentals',
    description: 'Learn the basics of React including components, props, and state',
    difficulty: 'beginner',
    duration: '20 min',
    category: 'React',
    steps: [
      {
        id: 'step-1',
        title: 'Creating Your First Component',
        description:
          "Components are the building blocks of React applications. Let's create a simple functional component.",
        code: `// Create a simple greeting component
function Greeting() {
  return <h1>Hello, World!</h1>;
}`,
        language: 'typescriptreact',
        hint: 'Components are just functions that return JSX',
      },
      {
        id: 'step-2',
        title: 'Adding Props',
        description: "Props allow you to pass data to components. Let's make our greeting dynamic.",
        code: `// Add a name prop to personalize the greeting
interface GreetingProps {
  name: string;
}

function Greeting({ name }: GreetingProps) {
  return <h1>Hello, {name}!</h1>;
}

// Usage: <Greeting name="Alice" />`,
        language: 'typescriptreact',
        highlightLines: [2, 3, 4, 6],
        hint: 'Props are destructured from the first argument',
      },
      {
        id: 'step-3',
        title: 'Using State',
        description: 'State allows components to manage their own data that can change over time.',
        code: `import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}`,
        language: 'typescriptreact',
        highlightLines: [3, 4, 9],
        validation: {
          type: 'contains',
          value: 'useState',
        },
      },
    ],
  },
  {
    id: 'typescript-basics',
    title: 'TypeScript Essentials',
    description: 'Master TypeScript types, interfaces, and type safety',
    difficulty: 'beginner',
    duration: '25 min',
    category: 'TypeScript',
    steps: [
      {
        id: 'ts-1',
        title: 'Basic Types',
        description: "TypeScript adds static types to JavaScript. Let's explore the basic types.",
        code: `// Basic types in TypeScript
let name: string = "Alice";
let age: number = 25;
let isActive: boolean = true;
let items: string[] = ["a", "b", "c"];`,
        language: 'typescript',
        hint: 'Types are specified after the variable name with a colon',
      },
      {
        id: 'ts-2',
        title: 'Interfaces',
        description: 'Interfaces define the shape of objects, making your code more predictable.',
        code: `// Define an interface for a User
interface User {
  id: number;
  name: string;
  email: string;
  isAdmin?: boolean; // Optional property
}

// Use the interface
const user: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com"
};`,
        language: 'typescript',
        highlightLines: [2, 3, 4, 5, 6],
      },
      {
        id: 'ts-3',
        title: 'Generics',
        description: 'Generics allow you to create reusable components that work with any type.',
        code: `// A generic function that works with any type
function identity<T>(value: T): T {
  return value;
}

// Usage
const num = identity<number>(42);
const str = identity<string>("hello");

// Generic interface
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}`,
        language: 'typescript',
        highlightLines: [2, 11],
      },
    ],
  },
  {
    id: 'async-await',
    title: 'Async/Await Mastery',
    description: 'Learn to handle asynchronous operations elegantly',
    difficulty: 'intermediate',
    duration: '15 min',
    category: 'JavaScript',
    steps: [
      {
        id: 'async-1',
        title: 'Basic Async Function',
        description: 'Async functions automatically return a Promise and allow using await.',
        code: `// Async function example
async function fetchUser(id: number) {
  const response = await fetch(\`/api/users/\${id}\`);
  const user = await response.json();
  return user;
}

// Calling the async function
fetchUser(1).then(user => console.log(user));`,
        language: 'typescript',
        highlightLines: [2, 3, 4],
      },
      {
        id: 'async-2',
        title: 'Error Handling',
        description: 'Always handle errors in async code with try-catch.',
        code: `async function fetchUserSafe(id: number) {
  try {
    const response = await fetch(\`/api/users/\${id}\`);
    
    if (!response.ok) {
      throw new Error(\`HTTP error: \${response.status}\`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
}`,
        language: 'typescript',
        highlightLines: [2, 10, 11, 12],
        validation: {
          type: 'contains',
          value: 'try',
        },
      },
    ],
  },
];

export function getTutorialById(id: string): Tutorial | undefined {
  return TUTORIALS.find((t) => t.id === id);
}
