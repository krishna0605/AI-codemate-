'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export interface Repo {
  id: string;
  name: string;
  description: string;
  stars: number;
  language: string;
  updated: string;
  defaultBranch: string;
}

interface GitHubRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (repo: Repo) => void;
  repos?: Repo[];
}

const GitHubRepoModal: React.FC<GitHubRepoModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  repos = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Filter repos based on search query
  const filteredRepos = repos.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      TypeScript: 'bg-blue-400',
      JavaScript: 'bg-yellow-400',
      Python: 'bg-blue-500',
      Java: 'bg-orange-500',
      Go: 'bg-cyan-400',
      Rust: 'bg-orange-600',
      Ruby: 'bg-red-500',
      PHP: 'bg-purple-400',
      'C++': 'bg-pink-500',
      C: 'bg-gray-400',
      'C#': 'bg-green-500',
      Swift: 'bg-orange-400',
      Kotlin: 'bg-purple-500',
      Vue: 'bg-green-400',
      HTML: 'bg-orange-500',
      CSS: 'bg-blue-500',
    };
    return colors[language] || 'bg-slate-400';
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0f1110] border border-white/10 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-in slide-in-from-bottom-4 zoom-in-95 duration-200">
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#141615]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-white">folder_open</span>
            <h2 className="text-lg font-semibold text-white">Select Repository</h2>
            <span className="text-xs text-slate-500 ml-2">({repos.length} repos)</span>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-4 border-b border-white/10 bg-[#0f1110]">
          <div className="bg-[#181a19] border border-white/5 rounded-lg px-3 py-2 flex items-center gap-2 focus-within:border-primary/50 transition-colors">
            <span className="material-symbols-outlined text-slate-500">search</span>
            <input
              type="text"
              placeholder="Search your repositories..."
              className="bg-transparent border-none outline-none text-sm text-white flex-1 placeholder:text-slate-600 focus:ring-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-500 hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 bg-[#0f1110]">
          {filteredRepos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <span className="material-symbols-outlined text-4xl mb-3">inbox</span>
              <p className="text-sm">
                {repos.length === 0 ? 'No repositories found' : 'No matching repositories'}
              </p>
            </div>
          ) : (
            filteredRepos.map((repo) => (
              <div
                key={repo.id}
                onClick={() => onSelect(repo)}
                className="p-3 hover:bg-white/5 rounded-lg cursor-pointer group transition-colors flex items-start gap-3 border border-transparent hover:border-white/5 mx-1"
              >
                <div className="mt-1">
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">
                    book
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-blue-400 group-hover:underline truncate">
                      {repo.name}
                    </h3>
                    <span className="text-[10px] text-slate-600 shrink-0 ml-2">{repo.updated}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 truncate">
                    {repo.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <span
                        className={`size-2 rounded-full ${getLanguageColor(repo.language)}`}
                      ></span>
                      {repo.language || 'Unknown'}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <span className="material-symbols-outlined text-[12px]">star</span>
                      {repo.stars}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <span className="material-symbols-outlined text-[12px]">call_split</span>
                      {repo.defaultBranch}
                    </div>
                  </div>
                </div>
                <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-slate-400">
                    arrow_forward_ios
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-white/10 flex justify-between items-center bg-[#141615]">
          <span className="text-xs text-slate-500">
            {filteredRepos.length} of {repos.length} repositories
          </span>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-slate-400 hover:text-white h-8 text-xs"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GitHubRepoModal;
