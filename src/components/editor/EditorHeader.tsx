'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Repo } from './GitHubRepoModal';
import { useAuth } from '@/hooks/useAuth';
import { useRepository } from '@/hooks/useRepository';

interface EditorHeaderProps {
  viewMode?: 'code' | 'split' | 'preview';
  setViewMode?: (mode: 'code' | 'split' | 'preview') => void;
  onMenuClick: () => void;
  isInspectorActive?: boolean;
  setIsInspectorActive?: (active: boolean) => void;
  currentRepo?: Repo | null;
  onHomeClick?: () => void;
  onOpenFeaturePanel?: (panel: 'learn' | 'snippets' | 'integrations') => void;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
  onMenuClick,
  currentRepo,
  onHomeClick,
  onOpenFeaturePanel,
}) => {
  const { user, logout, loading } = useAuth();
  const { repoOwner, repoName, selectedFilePath, defaultBranch } = useRepository();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRepoMenu, setShowRepoMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  // Parse file path into breadcrumb segments
  const getBreadcrumbs = () => {
    if (!selectedFilePath) return [];
    return selectedFilePath.split('/').filter(Boolean);
  };

  const breadcrumbs = getBreadcrumbs();
  const displayOwner = repoOwner || currentRepo?.name?.split('/')[0]?.trim() || 'user';
  const displayRepoName = repoName || currentRepo?.name?.split('/')[1]?.trim() || 'project';

  return (
    <header className="h-14 border-b border-border-dark bg-surface-dark flex items-center justify-between px-4 shrink-0 z-20 gap-4">
      {/* Left: Branding & Repo Context */}
      <div className="flex items-center gap-2 min-w-fit">
        <Tooltip content="Toggle Sidebar">
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-white mr-1"
            onClick={onMenuClick}
          >
            <span className="material-symbols-outlined">menu_open</span>
          </Button>
        </Tooltip>

        {/* App Logo - Clickable to go home */}
        <div
          onClick={onHomeClick}
          className="flex items-center gap-2 mr-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="size-7 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[18px]">terminal</span>
          </div>
          <span className="font-bold text-white tracking-tight hidden md:inline">AI CodeMate</span>
        </div>

        <div className="h-5 w-px bg-border-dark mx-2 hidden md:block"></div>

        {/* Repository Context Controls */}
        <div className="flex items-center gap-2">
          {/* Owner Display */}
          <Tooltip content={`Owner: ${displayOwner}`}>
            <button className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-surface-hover border border-transparent hover:border-border-dark transition-all group">
              <div className="size-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center ring-1 ring-indigo-500/30">
                <span className="text-[10px] font-bold">{displayOwner[0]?.toUpperCase()}</span>
              </div>
              <span className="text-sm font-medium text-slate-300 group-hover:text-white">
                {displayOwner}
              </span>
            </button>
          </Tooltip>

          <span className="text-slate-700">/</span>

          {/* Repo Selector with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRepoMenu(!showRepoMenu)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-surface-hover border border-transparent hover:border-border-dark transition-all group"
            >
              <div className="size-5 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="size-3.5 fill-slate-400 group-hover:fill-white transition-colors"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-slate-300 group-hover:text-white">
                {displayRepoName}
              </span>
              <span className="material-symbols-outlined text-[16px] text-slate-600 group-hover:text-slate-400">
                {showRepoMenu ? 'expand_less' : 'unfold_more'}
              </span>
            </button>

            {/* Repo Dropdown Menu */}
            {showRepoMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowRepoMenu(false)} />
                <div className="absolute left-0 top-full mt-2 w-72 bg-surface-dark border border-border-dark rounded-lg shadow-xl z-50 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Repo Info */}
                  <div className="px-4 py-3 border-b border-border-dark">
                    <div className="flex items-center gap-2 mb-2">
                      <svg
                        viewBox="0 0 24 24"
                        className="size-4 fill-slate-400"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                      <span className="text-sm font-semibold text-white">
                        {displayOwner}/{displayRepoName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">call_split</span>
                        {defaultBranch}
                      </span>
                      {currentRepo?.language && (
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                          {currentRepo.language}
                        </span>
                      )}
                      {currentRepo?.stars !== undefined && currentRepo.stars > 0 && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">star</span>
                          {currentRepo.stars}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <a
                    href={`https://github.com/${displayOwner}/${displayRepoName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-surface-hover flex items-center gap-3 transition-colors"
                    onClick={() => setShowRepoMenu(false)}
                  >
                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                    View on GitHub
                  </a>

                  <button
                    onClick={() => {
                      setShowRepoMenu(false);
                      onHomeClick?.();
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-surface-hover flex items-center gap-3 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                    Switch Repository
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Dynamic File Path (Breadcrumbs) */}
        <div className="hidden xl:flex items-center text-xs text-slate-500 gap-1 font-mono ml-4 pl-4 border-l border-border-dark/50">
          {breadcrumbs.length > 0 ? (
            breadcrumbs.map((segment, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                )}
                <span
                  className={cn(
                    'transition-colors',
                    index === breadcrumbs.length - 1
                      ? 'text-slate-300 font-medium'
                      : 'hover:text-slate-300 cursor-pointer'
                  )}
                >
                  {segment}
                </span>
              </React.Fragment>
            ))
          ) : (
            <span className="text-slate-600 italic">No file selected</span>
          )}
        </div>
      </div>

      {/* Right: User Actions */}
      <div className="flex items-center gap-3 justify-end shrink-0">
        {/* Feature Toolbar Buttons */}
        <div className="flex items-center gap-1">
          <Tooltip content="Learn - Tutorials & Challenges">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-surface-hover"
              onClick={() => onOpenFeaturePanel?.('learn')}
            >
              <span className="material-symbols-outlined text-[18px]">school</span>
            </Button>
          </Tooltip>

          <Tooltip content="Snippets & Templates">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-surface-hover"
              onClick={() => onOpenFeaturePanel?.('snippets')}
            >
              <span className="material-symbols-outlined text-[18px]">data_object</span>
            </Button>
          </Tooltip>

          <Tooltip content="Integrations - API, Database, Deploy">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-surface-hover"
              onClick={() => onOpenFeaturePanel?.('integrations')}
            >
              <span className="material-symbols-outlined text-[18px]">extension</span>
            </Button>
          </Tooltip>
        </div>

        <div className="h-4 w-px bg-border-dark"></div>

        {/* AI Features Indicator - Coming Soon */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg">
          <span className="material-symbols-outlined text-primary text-[16px]">smart_toy</span>
          <span className="text-xs font-medium text-primary">AI Features</span>
          <span className="text-[10px] text-primary/60 bg-primary/10 px-1.5 py-0.5 rounded">
            Coming Soon
          </span>
        </div>

        <div className="h-4 w-px bg-border-dark"></div>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 hover:bg-surface-hover p-1 pr-3 rounded-full transition-colors group"
          >
            <div className="size-7 rounded-full bg-gradient-to-tr from-primary to-emerald-600 p-[1px]">
              <div className="rounded-full bg-surface-dark p-0.5 w-full h-full flex items-center justify-center text-primary text-xs font-bold">
                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
            </div>
            <span className="material-symbols-outlined text-[16px] text-slate-500">
              {showUserMenu ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              {/* Menu */}
              <div className="absolute right-0 top-full mt-2 w-56 bg-surface-dark border border-border-dark rounded-lg shadow-xl z-50 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-border-dark">
                  <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-3 transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  {loading ? 'Logging out...' : 'Log out'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default EditorHeader;
