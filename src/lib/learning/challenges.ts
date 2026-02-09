// Code challenge types and default challenges

export interface CodeChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'bug-hunt' | 'refactor' | 'build' | 'algorithm';
  timeLimit?: number; // minutes
  starterCode: string;
  language: string;
  testCases: TestCase[];
  hints?: string[];
  solution?: string;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  description: string;
}

export const CHALLENGES: CodeChallenge[] = [
  {
    id: 'fix-counter',
    title: 'Fix the Counter Bug',
    description:
      'This counter component has a bug that causes it to not update correctly. Find and fix the issue.',
    difficulty: 'easy',
    type: 'bug-hunt',
    timeLimit: 10,
    language: 'typescriptreact',
    starterCode: `import { useState } from 'react';

function Counter() {
  let count = 0; // Bug: should use useState

  const increment = () => {
    count = count + 1;
    console.log(count); // Logs correctly but UI doesn't update
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+1</button>
    </div>
  );
}`,
    testCases: [
      {
        id: 'tc-1',
        input: 'Click button 3 times',
        expectedOutput: 'Count displays 3',
        description: 'Counter should update on click',
      },
    ],
    hints: [
      'React needs to know when state changes to re-render',
      'Local variables are reset on every render',
      'Try using the useState hook',
    ],
    solution: `import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  const increment = () => {
    setCount(count + 1);
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+1</button>
    </div>
  );
}`,
  },
  {
    id: 'refactor-promise',
    title: 'Refactor to Async/Await',
    description: 'Convert this promise chain to use async/await for better readability.',
    difficulty: 'easy',
    type: 'refactor',
    timeLimit: 15,
    language: 'typescript',
    starterCode: `function fetchUserData(userId: string) {
  return fetch(\`/api/users/\${userId}\`)
    .then(response => {
      if (!response.ok) {
        throw new Error('User not found');
      }
      return response.json();
    })
    .then(user => {
      return fetch(\`/api/posts?userId=\${user.id}\`);
    })
    .then(response => response.json())
    .then(posts => {
      return { user, posts };
    })
    .catch(error => {
      console.error('Error:', error);
      throw error;
    });
}`,
    testCases: [
      {
        id: 'tc-1',
        input: 'async keyword',
        expectedOutput: 'Function uses async',
        description: 'Function should be async',
      },
      {
        id: 'tc-2',
        input: 'await keyword',
        expectedOutput: 'Uses await for promises',
        description: 'Should await fetch calls',
      },
    ],
    hints: [
      'Add async before the function',
      'Replace .then() chains with await',
      'Use try-catch for error handling',
    ],
  },
  {
    id: 'implement-debounce',
    title: 'Implement Debounce',
    description:
      'Implement a debounce function that delays executing a callback until after a specified wait time has elapsed since the last call.',
    difficulty: 'medium',
    type: 'build',
    timeLimit: 20,
    language: 'typescript',
    starterCode: `// Implement the debounce function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  // Your implementation here
}

// Usage example:
// const debouncedSearch = debounce((query: string) => {
//   console.log('Searching for:', query);
// }, 300);`,
    testCases: [
      {
        id: 'tc-1',
        input: 'Call debounced function 5 times rapidly',
        expectedOutput: 'Original function called only once',
        description: 'Should only call function once after waiting',
      },
      {
        id: 'tc-2',
        input: 'Call with different arguments',
        expectedOutput: 'Uses latest arguments',
        description: 'Should use the most recent arguments',
      },
    ],
    hints: [
      'Use setTimeout to delay execution',
      'Store the timeout ID to clear previous timers',
      'Use closure to maintain state between calls',
    ],
    solution: `function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}`,
  },
  {
    id: 'array-flatten',
    title: 'Flatten Nested Array',
    description: 'Implement a function that flattens a deeply nested array to a single level.',
    difficulty: 'medium',
    type: 'algorithm',
    timeLimit: 15,
    language: 'typescript',
    starterCode: `// Flatten a nested array of any depth
function flatten<T>(arr: (T | T[])[]): T[] {
  // Your implementation here
}

// Examples:
// flatten([1, [2, 3], [4, [5, 6]]]) => [1, 2, 3, 4, 5, 6]
// flatten(['a', ['b', ['c']]]) => ['a', 'b', 'c']`,
    testCases: [
      {
        id: 'tc-1',
        input: '[1, [2, 3], [4, [5, 6]]]',
        expectedOutput: '[1, 2, 3, 4, 5, 6]',
        description: 'Should flatten nested numbers',
      },
      {
        id: 'tc-2',
        input: '[[[[1]]]]',
        expectedOutput: '[1]',
        description: 'Should handle deeply nested arrays',
      },
    ],
    hints: [
      'Consider using recursion',
      'Check if each element is an array',
      'Array.isArray() can help determine array type',
    ],
    solution: `function flatten<T>(arr: (T | T[])[]): T[] {
  const result: T[] = [];
  
  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flatten(item));
    } else {
      result.push(item);
    }
  }
  
  return result;
}`,
  },
];

export function getChallengeById(id: string): CodeChallenge | undefined {
  return CHALLENGES.find((c) => c.id === id);
}

export function getChallengesByType(type: CodeChallenge['type']): CodeChallenge[] {
  return CHALLENGES.filter((c) => c.type === type);
}
