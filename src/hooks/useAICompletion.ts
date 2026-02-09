import { useState, useCallback } from 'react';
import { useAIService } from '@/contexts/AIContext';
import { debounce } from '@/lib/utils';
import { Position } from 'monaco-editor';

export function useAICompletion() {
  const [isLoading, setIsLoading] = useState(false);
  const { service } = useAIService();

  // Create a debounced function that persists across renders
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedComplete = useCallback(
    debounce(async (code: string, position: Position, callback: (completion: string) => void) => {
      setIsLoading(true);
      try {
        const completion = await service.complete(code, {
          line: position.lineNumber,
          column: position.column,
        });
        callback(completion);
      } catch (error) {
        console.error('Completion error:', error);
        callback('');
      } finally {
        setIsLoading(false);
      }
    }, 500),
    [service]
  );

  return { getCompletion: debouncedComplete, isLoading };
}
