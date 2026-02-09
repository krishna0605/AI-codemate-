'use client';

import { useEffect, useCallback, useRef } from 'react';

export interface KeyboardShortcut {
  id: string;
  name: string;
  description: string;
  keys: string[]; // e.g., ['Ctrl', 'Shift', 'P']
  category: 'editor' | 'navigation' | 'git' | 'ai' | 'general';
  action: () => void;
  enabled?: boolean;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsOptions) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // Allow some shortcuts even in input fields
        if (!(event.ctrlKey || event.metaKey)) return;
      }

      for (const shortcut of shortcutsRef.current) {
        if (shortcut.enabled === false) continue;

        const keys = shortcut.keys.map((k) => k.toLowerCase());
        const pressedKeys: string[] = [];

        if (event.ctrlKey || event.metaKey) pressedKeys.push('ctrl');
        if (event.shiftKey) pressedKeys.push('shift');
        if (event.altKey) pressedKeys.push('alt');
        pressedKeys.push(event.key.toLowerCase());

        // Check if all required keys are pressed
        const allKeysMatch =
          keys.every((k) => pressedKeys.includes(k)) && pressedKeys.length === keys.length;

        if (allKeysMatch) {
          event.preventDefault();
          event.stopPropagation();
          shortcut.action();
          return;
        }
      }
    },
    [enabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Default shortcut definitions
export const DEFAULT_SHORTCUTS: Omit<KeyboardShortcut, 'action'>[] = [
  // Editor shortcuts
  {
    id: 'save',
    name: 'Save File',
    description: 'Save the current file',
    keys: ['Ctrl', 'S'],
    category: 'editor',
  },
  {
    id: 'save-all',
    name: 'Save All',
    description: 'Save all open files',
    keys: ['Ctrl', 'Shift', 'S'],
    category: 'editor',
  },
  {
    id: 'undo',
    name: 'Undo',
    description: 'Undo last action',
    keys: ['Ctrl', 'Z'],
    category: 'editor',
  },
  {
    id: 'redo',
    name: 'Redo',
    description: 'Redo last undone action',
    keys: ['Ctrl', 'Y'],
    category: 'editor',
  },
  {
    id: 'find',
    name: 'Find',
    description: 'Find in file',
    keys: ['Ctrl', 'F'],
    category: 'editor',
  },
  {
    id: 'replace',
    name: 'Replace',
    description: 'Find and replace',
    keys: ['Ctrl', 'H'],
    category: 'editor',
  },

  // Navigation shortcuts
  {
    id: 'command-palette',
    name: 'Command Palette',
    description: 'Open command palette',
    keys: ['Ctrl', 'Shift', 'P'],
    category: 'navigation',
  },
  {
    id: 'quick-open',
    name: 'Quick Open',
    description: 'Open file quickly',
    keys: ['Ctrl', 'P'],
    category: 'navigation',
  },
  {
    id: 'go-to-line',
    name: 'Go to Line',
    description: 'Jump to a specific line',
    keys: ['Ctrl', 'G'],
    category: 'navigation',
  },
  {
    id: 'toggle-sidebar',
    name: 'Toggle Sidebar',
    description: 'Show/hide sidebar',
    keys: ['Ctrl', 'B'],
    category: 'navigation',
  },

  // AI shortcuts
  {
    id: 'ai-complete',
    name: 'AI Complete',
    description: 'Trigger AI autocomplete',
    keys: ['Ctrl', 'Space'],
    category: 'ai',
  },
  {
    id: 'ai-explain',
    name: 'AI Explain',
    description: 'Explain selected code',
    keys: ['Ctrl', 'Shift', 'E'],
    category: 'ai',
  },
  {
    id: 'ai-refactor',
    name: 'AI Refactor',
    description: 'Get refactoring suggestions',
    keys: ['Ctrl', 'Shift', 'R'],
    category: 'ai',
  },

  // Git shortcuts
  {
    id: 'git-commit',
    name: 'Git Commit',
    description: 'Open commit dialog',
    keys: ['Ctrl', 'Shift', 'G'],
    category: 'git',
  },
  {
    id: 'git-push',
    name: 'Git Push',
    description: 'Push to remote',
    keys: ['Ctrl', 'Shift', 'U'],
    category: 'git',
  },

  // General shortcuts
  {
    id: 'focus-mode',
    name: 'Focus Mode',
    description: 'Toggle focus mode',
    keys: ['F11'],
    category: 'general',
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'Open settings',
    keys: ['Ctrl', ','],
    category: 'general',
  },
];

// Format shortcut keys for display
export function formatShortcutKeys(keys: string[]): string {
  return keys
    .map((k) => {
      switch (k.toLowerCase()) {
        case 'ctrl':
          return '⌃';
        case 'shift':
          return '⇧';
        case 'alt':
          return '⌥';
        case 'meta':
        case 'cmd':
          return '⌘';
        case 'enter':
          return '↵';
        case 'escape':
          return 'Esc';
        case 'backspace':
          return '⌫';
        case 'delete':
          return 'Del';
        case 'arrowup':
          return '↑';
        case 'arrowdown':
          return '↓';
        case 'arrowleft':
          return '←';
        case 'arrowright':
          return '→';
        default:
          return k.toUpperCase();
      }
    })
    .join(' + ');
}
