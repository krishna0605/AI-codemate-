'use client';

import React, { useEffect, useState } from 'react';
import { useGit } from '@/hooks/useGit';

interface CommitHistoryProps {
  onSelectCommit?: (sha: string) => void;
}

export const CommitHistory: React.FC<CommitHistoryProps> = ({ onSelectCommit }) => {
  const { commits, loadCommits, currentBranch } = useGit();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSha, setSelectedSha] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    loadCommits().finally(() => setIsLoading(false));
  }, [loadCommits]);

  const handleSelectCommit = (sha: string) => {
    setSelectedSha(sha);
    onSelectCommit?.(sha);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return `${minutes}m ago`;
      }
      return `${hours}h ago`;
    }
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading && commits.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-sm">
        <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
        Loading commits...
      </div>
    );
  }

  if (commits.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 text-sm p-4">
        <span className="material-symbols-outlined text-4xl mb-2">history</span>
        <p>No commits found</p>
        <p className="text-xs mt-1">on {currentBranch}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Header */}
      <div className="p-3 border-b border-[#3e3e42] flex items-center justify-between">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">history</span>
          Commit History
        </h3>
        <span className="text-xs text-gray-500 bg-[#3e3e42] px-2 py-0.5 rounded">
          {currentBranch}
        </span>
      </div>

      {/* Commits List */}
      <div className="flex-1 overflow-y-auto">
        {commits.map((commit, idx) => (
          <div
            key={commit.sha}
            onClick={() => handleSelectCommit(commit.sha)}
            className={`p-3 border-b border-[#3e3e42] cursor-pointer transition-colors ${
              selectedSha === commit.sha
                ? 'bg-blue-600/20 border-l-2 border-l-blue-500'
                : 'hover:bg-[#2a2d2e]'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {commit.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={commit.avatarUrl}
                    alt={commit.author}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#3e3e42] flex items-center justify-center text-xs text-gray-400">
                    {commit.author.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{commit.message.split('\n')[0]}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <span>{commit.author}</span>
                  <span>•</span>
                  <span>{formatDate(commit.date)}</span>
                </div>
              </div>

              {/* SHA */}
              <div className="flex-shrink-0">
                <code className="text-[10px] text-blue-400 bg-blue-900/20 px-1.5 py-0.5 rounded font-mono">
                  {commit.sha.substring(0, 7)}
                </code>
              </div>
            </div>

            {/* Timeline indicator */}
            {idx < commits.length - 1 && <div className="ml-[15px] mt-2 w-0.5 h-3 bg-[#3e3e42]" />}
          </div>
        ))}
      </div>
    </div>
  );
};
