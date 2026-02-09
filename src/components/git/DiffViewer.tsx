'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useGit } from '@/hooks/useGit';
import { useRepository } from '@/hooks/useRepository';

type DiffMode = 'side-by-side' | 'inline';

interface DiffLine {
  type: 'unchanged' | 'added' | 'removed';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

interface DiffViewerProps {
  filePath?: string;
  compareRef?: string; // Branch or commit SHA to compare against
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ filePath, compareRef }) => {
  const { currentFile } = useRepository();
  const { getOriginalContent, currentBranch } = useGit();

  const [originalContent, setOriginalContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<DiffMode>('side-by-side');

  const path = filePath || currentFile?.path;
  const currentContent = currentFile?.content || '';

  // Load original content for comparison
  useEffect(() => {
    if (!path) return;

    setIsLoading(true);
    getOriginalContent(path)
      .then((content) => setOriginalContent(content))
      .finally(() => setIsLoading(false));
  }, [path, getOriginalContent]);

  // Compute diff lines
  const diffLines = useMemo(() => {
    if (originalContent === null) return [];
    return computeDiff(originalContent, currentContent);
  }, [originalContent, currentContent]);

  const hasChanges = diffLines.some((line) => line.type !== 'unchanged');

  if (!path) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-sm">
        <p>Open a file to view changes</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-sm">
        <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
        Loading original file...
      </div>
    );
  }

  if (!hasChanges) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 text-sm p-4">
        <span className="material-symbols-outlined text-4xl text-green-400 mb-2">check_circle</span>
        <p>No changes detected</p>
        <p className="text-xs mt-1">File matches {currentBranch}</p>
      </div>
    );
  }

  const stats = diffLines.reduce(
    (acc, line) => {
      if (line.type === 'added') acc.additions++;
      if (line.type === 'removed') acc.deletions++;
      return acc;
    },
    { additions: 0, deletions: 0 }
  );

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Header */}
      <div className="p-3 border-b border-[#3e3e42] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium text-white truncate">{path.split('/').pop()}</h3>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-green-400">+{stats.additions}</span>
            <span className="text-red-400">-{stats.deletions}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('side-by-side')}
            className={`px-2 py-1 text-xs rounded ${
              mode === 'side-by-side'
                ? 'bg-blue-600 text-white'
                : 'bg-[#3e3e42] text-gray-400 hover:text-white'
            }`}
          >
            Side-by-Side
          </button>
          <button
            onClick={() => setMode('inline')}
            className={`px-2 py-1 text-xs rounded ${
              mode === 'inline'
                ? 'bg-blue-600 text-white'
                : 'bg-[#3e3e42] text-gray-400 hover:text-white'
            }`}
          >
            Inline
          </button>
        </div>
      </div>

      {/* Diff Content */}
      <div className="flex-1 overflow-auto font-mono text-xs">
        {mode === 'side-by-side' ? (
          <SideBySideDiff lines={diffLines} />
        ) : (
          <InlineDiff lines={diffLines} />
        )}
      </div>
    </div>
  );
};

// Side-by-side diff view
const SideBySideDiff: React.FC<{ lines: DiffLine[] }> = ({ lines }) => {
  // Split into left (original) and right (current) columns
  const leftLines: DiffLine[] = [];
  const rightLines: DiffLine[] = [];

  lines.forEach((line) => {
    if (line.type === 'removed') {
      leftLines.push(line);
      rightLines.push({
        type: 'unchanged',
        content: '',
        oldLineNumber: undefined,
        newLineNumber: undefined,
      });
    } else if (line.type === 'added') {
      leftLines.push({
        type: 'unchanged',
        content: '',
        oldLineNumber: undefined,
        newLineNumber: undefined,
      });
      rightLines.push(line);
    } else {
      leftLines.push(line);
      rightLines.push(line);
    }
  });

  return (
    <div className="flex">
      <div className="w-1/2 border-r border-[#3e3e42]">
        <div className="px-2 py-1 bg-[#252526] text-gray-500 text-[10px] sticky top-0">
          Original (remote)
        </div>
        {leftLines.map((line, idx) => (
          <DiffLineRow key={`left-${idx}`} line={line} side="left" />
        ))}
      </div>
      <div className="w-1/2">
        <div className="px-2 py-1 bg-[#252526] text-gray-500 text-[10px] sticky top-0">
          Current (local)
        </div>
        {rightLines.map((line, idx) => (
          <DiffLineRow key={`right-${idx}`} line={line} side="right" />
        ))}
      </div>
    </div>
  );
};

// Inline diff view
const InlineDiff: React.FC<{ lines: DiffLine[] }> = ({ lines }) => {
  return (
    <div>
      {lines.map((line, idx) => (
        <DiffLineRow key={idx} line={line} side="inline" />
      ))}
    </div>
  );
};

// Single diff line
const DiffLineRow: React.FC<{ line: DiffLine; side: 'left' | 'right' | 'inline' }> = ({
  line,
  side,
}) => {
  const getBgColor = () => {
    if (line.type === 'added') return 'bg-green-900/30';
    if (line.type === 'removed') return 'bg-red-900/30';
    return '';
  };

  const getTextColor = () => {
    if (line.type === 'added') return 'text-green-300';
    if (line.type === 'removed') return 'text-red-300';
    return 'text-gray-400';
  };

  const getPrefix = () => {
    if (line.type === 'added') return '+';
    if (line.type === 'removed') return '-';
    return ' ';
  };

  const lineNumber = side === 'left' || side === 'inline' ? line.oldLineNumber : line.newLineNumber;

  return (
    <div className={`flex ${getBgColor()} hover:bg-white/5`}>
      <div className="w-10 text-right pr-2 text-gray-600 select-none border-r border-[#3e3e42]">
        {lineNumber || ''}
      </div>
      <div className={`flex-1 px-2 whitespace-pre ${getTextColor()}`}>
        {side === 'inline' && (
          <span className={line.type !== 'unchanged' ? 'font-bold' : ''}>{getPrefix()}</span>
        )}
        {line.content}
      </div>
    </div>
  );
};

/**
 * Simple line-by-line diff algorithm
 * For production, consider using a library like 'diff' or 'jsdiff'
 */
function computeDiff(original: string, current: string): DiffLine[] {
  const originalLines = original.split('\n');
  const currentLines = current.split('\n');
  const result: DiffLine[] = [];

  // Simple LCS-based diff
  const lcs = longestCommonSubsequence(originalLines, currentLines);

  let origIdx = 0;
  let currIdx = 0;
  let lcsIdx = 0;

  while (origIdx < originalLines.length || currIdx < currentLines.length) {
    if (
      lcsIdx < lcs.length &&
      origIdx < originalLines.length &&
      originalLines[origIdx] === lcs[lcsIdx]
    ) {
      if (currIdx < currentLines.length && currentLines[currIdx] === lcs[lcsIdx]) {
        // Unchanged line
        result.push({
          type: 'unchanged',
          content: originalLines[origIdx],
          oldLineNumber: origIdx + 1,
          newLineNumber: currIdx + 1,
        });
        origIdx++;
        currIdx++;
        lcsIdx++;
      } else {
        // Added line in current
        result.push({
          type: 'added',
          content: currentLines[currIdx],
          newLineNumber: currIdx + 1,
        });
        currIdx++;
      }
    } else if (origIdx < originalLines.length) {
      // Removed line from original
      result.push({
        type: 'removed',
        content: originalLines[origIdx],
        oldLineNumber: origIdx + 1,
      });
      origIdx++;
    } else if (currIdx < currentLines.length) {
      // Added line (past original)
      result.push({
        type: 'added',
        content: currentLines[currIdx],
        newLineNumber: currIdx + 1,
      });
      currIdx++;
    }
  }

  return result;
}

/**
 * Compute longest common subsequence of lines
 */
function longestCommonSubsequence(a: string[], b: string[]): string[] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to find LCS
  const lcs: string[] = [];
  let i = m,
    j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      lcs.unshift(a[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return lcs;
}
