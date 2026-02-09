'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useGit } from '@/hooks/useGit';
import { CommitModal } from './CommitModal';
import { CommitHistory } from '@/components/git/CommitHistory';
import { BranchManager } from '@/components/git/BranchManager';

// Format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function GitPanel() {
  const {
    status,
    error,
    hasChanges,
    changedFiles,
    commits,
    branches,
    currentBranch,
    isSaving,
    saveAllFiles,
    discardChanges,
    discardAllChanges,
    loadCommits,
    loadBranches,
    clearError,
  } = useGit();

  const [showCommitModal, setShowCommitModal] = useState(false);
  const [gitTab, setGitTab] = useState<'changes' | 'history' | 'branches'>('changes');
  const [expandedSections, setExpandedSections] = useState({
    changes: true,
    commits: true,
    branches: false,
  });

  // Load commits and branches on mount
  useEffect(() => {
    loadCommits();
    loadBranches();
  }, [loadCommits, loadBranches]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCommit = async (message: string) => {
    const success = await saveAllFiles(message);
    if (success) {
      setShowCommitModal(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'saving':
      case 'committing':
        return (
          <span className="material-symbols-outlined text-[14px] text-blue-400 animate-spin">
            progress_activity
          </span>
        );
      case 'error':
        return <span className="material-symbols-outlined text-[14px] text-red-400">error</span>;
      case 'dirty':
        return (
          <span className="material-symbols-outlined text-[14px] text-amber-400">pending</span>
        );
      default:
        return (
          <span className="material-symbols-outlined text-[14px] text-emerald-400">
            check_circle
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-full text-sm">
      {/* Status Bar */}
      <div className="p-3 border-b border-border-dark bg-black/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-xs text-slate-400 capitalize">{status}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span className="material-symbols-outlined text-[14px]">call_split</span>
            <span>{currentBranch}</span>
          </div>
        </div>
      </div>

      {/* Sub-tabs for Changes | History | Branches */}
      <div className="flex border-b border-border-dark">
        <button
          onClick={() => setGitTab('changes')}
          className={cn(
            'flex-1 py-2 text-[10px] font-medium transition-colors flex items-center justify-center gap-1',
            gitTab === 'changes'
              ? 'text-white border-b-2 border-primary bg-black/20'
              : 'text-slate-500 hover:text-slate-300'
          )}
        >
          <span className="material-symbols-outlined text-[12px]">edit_note</span>
          Changes
          {changedFiles.length > 0 && (
            <span className="px-1 py-0.5 bg-amber-500/20 text-amber-400 text-[9px] rounded-full">
              {changedFiles.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setGitTab('history')}
          className={cn(
            'flex-1 py-2 text-[10px] font-medium transition-colors flex items-center justify-center gap-1',
            gitTab === 'history'
              ? 'text-white border-b-2 border-primary bg-black/20'
              : 'text-slate-500 hover:text-slate-300'
          )}
        >
          <span className="material-symbols-outlined text-[12px]">history</span>
          History
        </button>
        <button
          onClick={() => setGitTab('branches')}
          className={cn(
            'flex-1 py-2 text-[10px] font-medium transition-colors flex items-center justify-center gap-1',
            gitTab === 'branches'
              ? 'text-white border-b-2 border-primary bg-black/20'
              : 'text-slate-500 hover:text-slate-300'
          )}
        >
          <span className="material-symbols-outlined text-[12px]">call_split</span>
          Branches
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mx-3 mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-md">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-[16px] text-red-400 mt-0.5">error</span>
            <div className="flex-1">
              <p className="text-xs text-red-400">{error}</p>
              <button onClick={clearError} className="text-[10px] text-red-300 underline mt-1">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {gitTab === 'changes' && (
        <>
          {/* Changes Section */}
          <div className="border-b border-border-dark">
            <button
              onClick={() => toggleSection('changes')}
              className="w-full px-3 py-2 flex items-center justify-between hover:bg-surface-hover transition-colors"
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'material-symbols-outlined text-[14px] transition-transform',
                    expandedSections.changes ? 'rotate-90' : ''
                  )}
                >
                  chevron_right
                </span>
                <span className="text-xs font-medium text-slate-300">CHANGES</span>
              </div>
              {changedFiles.length > 0 && (
                <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] rounded-full font-medium">
                  {changedFiles.length}
                </span>
              )}
            </button>

            {expandedSections.changes && (
              <div className="px-3 pb-3">
                {changedFiles.length === 0 ? (
                  <div className="text-xs text-slate-500 text-center py-4">
                    <span className="material-symbols-outlined text-[24px] block mb-1 text-slate-600">
                      inventory_2
                    </span>
                    No changes
                  </div>
                ) : (
                  <>
                    <div className="space-y-1 mb-3">
                      {changedFiles.map((file) => (
                        <div
                          key={file.path}
                          className="flex items-center justify-between py-1 px-2 rounded hover:bg-surface-hover group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={cn(
                                'w-1.5 h-1.5 rounded-full flex-shrink-0',
                                file.status === 'modified' && 'bg-amber-400',
                                file.status === 'added' && 'bg-green-400',
                                file.status === 'deleted' && 'bg-red-400'
                              )}
                            />
                            <span className="text-xs text-slate-300 truncate">
                              {file.path.split('/').pop()}
                            </span>
                          </div>
                          <button
                            onClick={() => discardChanges(file.path)}
                            className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all"
                            title="Discard changes"
                          >
                            <span className="material-symbols-outlined text-[14px]">undo</span>
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <button
                        onClick={() => setShowCommitModal(true)}
                        disabled={isSaving}
                        className="w-full py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSaving ? (
                          <>
                            <span className="material-symbols-outlined text-[14px] animate-spin">
                              progress_activity
                            </span>
                            Saving...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[14px]">check</span>
                            Commit Changes
                          </>
                        )}
                      </button>
                      <button
                        onClick={discardAllChanges}
                        className="w-full py-1.5 text-slate-400 hover:text-red-400 text-xs transition-colors"
                      >
                        Discard All
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {gitTab === 'history' && (
        <div className="flex-1 overflow-hidden">
          <CommitHistory />
        </div>
      )}

      {gitTab === 'branches' && (
        <div className="flex-1 overflow-hidden">
          <BranchManager />
        </div>
      )}

      {/* Commit Modal */}
      <CommitModal
        isOpen={showCommitModal}
        onClose={() => setShowCommitModal(false)}
        changedFiles={changedFiles}
        onCommit={handleCommit}
        isCommitting={isSaving}
      />
    </div>
  );
}

export default GitPanel;
