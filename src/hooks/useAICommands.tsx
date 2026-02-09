'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useAIService } from '@/contexts/AIContext';
import { useRepository } from '@/hooks/useRepository';
import { buildContextPrompt } from '@/lib/ai/contextBuilder';

export interface AICommandLine {
  id: string;
  type: 'user' | 'assistant' | 'system' | 'error';
  content: string;
  timestamp: Date;
}

interface AICommandsContextType {
  lines: AICommandLine[];
  commandHistory: string[];
  historyIndex: number;
  currentInput: string;
  isProcessing: boolean;
  addLine: (type: AICommandLine['type'], content: string) => void;
  executeCommand: (command: string) => void;
  clearCommands: () => void;
  setCurrentInput: (input: string) => void;
  navigateHistory: (direction: 'up' | 'down') => void;
}

const AICommandsContext = createContext<AICommandsContextType | null>(null);

const generateId = () => Math.random().toString(36).substring(2, 11);

export function AICommandsProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<AICommandLine[]>([
    {
      id: generateId(),
      type: 'system',
      content: '🤖 AI Assistant ready. Type a command or ask a question about your code.',
      timestamp: new Date(),
    },
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentInput, setCurrentInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { service } = useAIService();

  const { fileTree, openFiles, currentFile, repoOwner, repoName } = useRepository();

  const addLine = useCallback((type: AICommandLine['type'], content: string) => {
    setLines((prev) => [...prev, { id: generateId(), type, content, timestamp: new Date() }]);
  }, []);

  const executeCommand = useCallback(
    async (command: string) => {
      const trimmedCmd = command.trim();
      if (!trimmedCmd) return;

      setCommandHistory((prev) => [...prev, command]);
      setHistoryIndex(-1);
      addLine('user', command);

      if (trimmedCmd.toLowerCase() === 'clear') {
        setLines([]);
        return;
      }

      setIsProcessing(true);

      try {
        // Create message history for context
        // Note: We use 'lines' from the closure. It doesn't contain the just-added user command.
        const messages = lines
          .filter((l) => l.type === 'user' || l.type === 'assistant')
          .map((l) => ({
            role: (l.type === 'user' ? 'user' : 'model') as 'user' | 'model',
            parts: l.content,
          }));

        // Build context prompt
        const contextPrompt = buildContextPrompt(fileTree, openFiles, currentFile, {
          owner: repoOwner,
          name: repoName,
        });

        // Call AI Service with context
        const response = await service.chat(messages, command, contextPrompt);

        addLine('assistant', response);
      } catch (error) {
        console.error('AI Command Error:', error);
        addLine(
          'error',
          `Error: ${error instanceof Error ? error.message : 'Failed to process command'}`
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [lines, addLine, service, fileTree, openFiles, currentFile, repoOwner, repoName]
  );

  const clearCommands = useCallback(() => {
    setLines([]);
  }, []);

  const navigateHistory = useCallback(
    (direction: 'up' | 'down') => {
      if (commandHistory.length === 0) return;

      if (direction === 'up') {
        const newIndex =
          historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex] || '');
      } else {
        if (historyIndex === -1) return;
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentInput('');
        } else {
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[newIndex] || '');
        }
      }
    },
    [commandHistory, historyIndex]
  );

  const value: AICommandsContextType = {
    lines,
    commandHistory,
    historyIndex,
    currentInput,
    isProcessing,
    addLine,
    executeCommand,
    clearCommands,
    setCurrentInput,
    navigateHistory,
  };

  return <AICommandsContext.Provider value={value}>{children}</AICommandsContext.Provider>;
}

export function useAICommands() {
  const context = useContext(AICommandsContext);
  if (!context) {
    throw new Error('useAICommands must be used within an AICommandsProvider');
  }
  return context;
}
