// Tips data and types

export interface Tip {
  id: string;
  title: string;
  content: string;
  category: 'performance' | 'security' | 'best-practice' | 'tooling' | 'language';
  language?: string; // If tip is language-specific
  docLink?: string;
}

export const TIPS: Tip[] = [
  {
    id: 'use-memo',
    title: 'Optimize with useMemo',
    content:
      'Use useMemo to memoize expensive calculations. It only recomputes when dependencies change, preventing unnecessary recalculations on every render.',
    category: 'performance',
    language: 'react',
    docLink: 'https://react.dev/reference/react/useMemo',
  },
  {
    id: 'const-assertions',
    title: 'TypeScript const Assertions',
    content:
      'Use "as const" to create readonly tuples and narrow literal types. This is especially useful for action types and configuration objects.',
    category: 'language',
    language: 'typescript',
    docLink:
      'https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#readonly-and-const',
  },
  {
    id: 'env-validation',
    title: 'Validate Environment Variables',
    content:
      'Always validate environment variables at startup using a schema library like Zod. Fail fast if required variables are missing.',
    category: 'best-practice',
  },
  {
    id: 'avoid-any',
    title: 'Avoid "any" Type',
    content:
      'Using "any" disables TypeScript\'s type checking. Use "unknown" instead when you don\'t know the type, then narrow it with type guards.',
    category: 'language',
    language: 'typescript',
  },
  {
    id: 'xss-prevention',
    title: 'Prevent XSS Attacks',
    content:
      'Never use dangerouslySetInnerHTML with user input. Always sanitize HTML content using a library like DOMPurify before rendering.',
    category: 'security',
    language: 'react',
  },
  {
    id: 'lazy-loading',
    title: 'Lazy Load Components',
    content:
      'Use React.lazy() and Suspense to code-split your app. This reduces initial bundle size and improves load times.',
    category: 'performance',
    language: 'react',
    docLink: 'https://react.dev/reference/react/lazy',
  },
  {
    id: 'error-boundaries',
    title: 'Use Error Boundaries',
    content:
      'Wrap your app in error boundaries to catch JavaScript errors and display fallback UI instead of crashing the entire app.',
    category: 'best-practice',
    language: 'react',
  },
  {
    id: 'git-conventional',
    title: 'Use Conventional Commits',
    content:
      'Follow the Conventional Commits spec (feat:, fix:, docs:, etc.) to enable automated changelogs and semantic versioning.',
    category: 'tooling',
    docLink: 'https://www.conventionalcommits.org/',
  },
  {
    id: 'optional-chaining',
    title: 'Optional Chaining (?.) ',
    content:
      'Use optional chaining to safely access nested properties. obj?.prop?.value returns undefined instead of throwing if any part is null/undefined.',
    category: 'language',
    language: 'typescript',
  },
  {
    id: 'key-prop',
    title: 'Use Stable Keys in Lists',
    content:
      'Always use stable, unique keys for list items. Avoid using array index as key when the list can reorder, as it causes bugs.',
    category: 'best-practice',
    language: 'react',
  },
];

// Get a random tip, optionally filtered by language
export function getRandomTip(language?: string): Tip {
  const filtered = language ? TIPS.filter((t) => !t.language || t.language === language) : TIPS;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

// Get all tips for a specific category
export function getTipsByCategory(category: Tip['category']): Tip[] {
  return TIPS.filter((t) => t.category === category);
}
