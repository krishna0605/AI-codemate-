'use client';

import React, { useEffect, useState } from 'react';
import { useGit } from '@/hooks/useGit';

interface BranchManagerProps {
  onBranchSwitch?: (branch: string) => void;
}

export const BranchManager: React.FC<BranchManagerProps> = ({ onBranchSwitch }) => {
  const { branches, loadBranches, currentBranch, createNewBranch, error, clearError } = useGit();
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setIsLoading(true);
    loadBranches().finally(() => setIsLoading(false));
  }, [loadBranches]);

  const filteredBranches = branches.filter((branch) =>
    branch.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateBranch = async () => {
    if (!newBranchName.trim()) return;

    setIsCreating(true);
    const success = await createNewBranch(newBranchName.trim());
    setIsCreating(false);

    if (success) {
      setNewBranchName('');
      setShowCreateModal(false);
    }
  };

  const handleSelectBranch = (branch: string) => {
    if (branch !== currentBranch) {
      onBranchSwitch?.(branch);
    }
  };

  if (isLoading && branches.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-sm">
        <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
        Loading branches...
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Header */}
      <div className="p-3 border-b border-[#3e3e42] flex items-center justify-between">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">account_tree</span>
          Branches
        </h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[14px]">add</span>
          New
        </button>
      </div>

      {/* Search */}
      <div className="p-2 border-b border-[#3e3e42]">
        <input
          type="text"
          placeholder="Search branches..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#252526] border border-[#3e3e42] rounded px-2 py-1.5 text-xs text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-2 mt-2 p-2 bg-red-900/30 border border-red-500/30 rounded text-xs text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={clearError} className="text-red-400 hover:text-red-200">
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        </div>
      )}

      {/* Branches List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredBranches.length === 0 ? (
          <p className="text-center text-gray-500 text-xs py-4">No branches found</p>
        ) : (
          <div className="space-y-1">
            {filteredBranches.map((branch) => (
              <div
                key={branch}
                onClick={() => handleSelectBranch(branch)}
                className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                  branch === currentBranch
                    ? 'bg-blue-600/20 text-blue-300'
                    : 'hover:bg-[#2a2d2e] text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">
                    {branch === currentBranch ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <span className="text-sm font-mono">{branch}</span>
                </div>
                {branch === currentBranch && (
                  <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded">
                    current
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Branch Modal */}
      {showCreateModal && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#252526] border border-[#3e3e42] rounded-lg p-4 w-80">
            <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Create New Branch
            </h4>
            <input
              type="text"
              placeholder="Branch name (e.g., feature/new-feature)"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateBranch()}
              className="w-full bg-[#1e1e1e] border border-[#3e3e42] rounded px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none mb-3"
              autoFocus
            />
            <p className="text-xs text-gray-500 mb-4">
              Branch will be created from <code className="text-blue-400">{currentBranch}</code>
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewBranchName('');
                }}
                className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBranch}
                disabled={!newBranchName.trim() || isCreating}
                className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded transition-colors flex items-center gap-1"
              >
                {isCreating ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[14px]">
                      progress_activity
                    </span>
                    Creating...
                  </>
                ) : (
                  'Create Branch'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
