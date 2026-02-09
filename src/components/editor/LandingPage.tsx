'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/Skeleton';
import GitHubRepoModal, { Repo } from './GitHubRepoModal';
import { useAuth } from '@/hooks/useAuth';
import { fetchGitHubRepos, formatRelativeTime, GitHubRepo } from '@/lib/github';

interface LandingPageProps {
  onStart: (repo?: Repo) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [inputValue, setInputValue] = useState('');
  const [showRepoModal, setShowRepoModal] = useState(false);
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [repoError, setRepoError] = useState<string | null>(null);

  const { user, logout, loading, providerToken, loginWithProvider, isGitHubConnected } = useAuth();

  const fetchRepos = useCallback(async () => {
    if (!providerToken) return;

    setLoadingRepos(true);
    setRepoError(null);

    try {
      const repos = await fetchGitHubRepos(providerToken);
      setGithubRepos(repos);
    } catch (error) {
      console.error('Failed to fetch repos:', error);
      setRepoError('Failed to fetch repositories');
    } finally {
      setLoadingRepos(false);
    }
  }, [providerToken]);

  // Fetch GitHub repos when provider token is available
  useEffect(() => {
    if (providerToken && isGitHubConnected) {
      fetchRepos();
    }
  }, [providerToken, isGitHubConnected, fetchRepos]);

  const handleLogout = async () => {
    await logout();
    setGithubRepos([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onStart();
    }
  };

  const handleConnectGitHub = () => {
    if (isGitHubConnected && githubRepos.length > 0) {
      // If already connected, show repo modal
      setShowRepoModal(true);
    } else {
      // Otherwise, trigger GitHub OAuth login
      loginWithProvider('github');
    }
  };

  const handleRepoSelect = (repo: Repo) => {
    setShowRepoModal(false);
    onStart(repo);
  };

  // Transform GitHub API repo to our Repo type
  const transformToRepo = (ghRepo: GitHubRepo): Repo => ({
    id: ghRepo.id.toString(),
    name: ghRepo.full_name,
    description: ghRepo.description || '',
    stars: ghRepo.stargazers_count,
    language: ghRepo.language || 'Unknown',
    updated: formatRelativeTime(ghRepo.updated_at),
    defaultBranch: ghRepo.default_branch,
  });

  return (
    <>
      <div className="min-h-screen bg-[#050505] text-slate-300 font-sans flex flex-col selection:bg-primary/20 selection:text-primary">
        {/* Navigation */}
        <nav className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#050505]/50 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[20px]">terminal</span>
            </div>
            <span className="font-bold text-white tracking-tight text-sm">AI CodeMate</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-slate-400 text-[20px] hover:text-white cursor-pointer">
              card_giftcard
            </span>

            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#1c1c1c] border border-white/10 rounded-md text-xs font-medium hover:bg-[#252525] transition-colors">
              <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
              Feedback
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-md text-xs font-medium text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              {loading ? 'Logging out...' : 'Logout'}
            </button>

            <span className="material-symbols-outlined text-slate-400 text-[20px] hover:text-white cursor-pointer">
              settings
            </span>

            {loading ? (
              <Skeleton variant="circular" className="size-8" />
            ) : (
              <div className="size-8 rounded-full bg-gradient-to-tr from-primary to-emerald-600 p-[1px]">
                <div className="rounded-full bg-black p-0.5 w-full h-full flex items-center justify-center text-primary text-xs font-bold">
                  {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="max-w-4xl w-full text-center z-10 animate-fade-in-quick">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6">
              Meet AI CodeMate: your autonomous <br />
              coding agent.
            </h1>
            <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              AI CodeMate will research, code, test, and then submit changes for review. Focus on
              what you care about while AI CodeMate works!
            </p>

            {/* Interactive Card */}
            <div className="bg-[#0f1110] border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-w-2xl mx-auto ring-1 ring-white/5">
              {/* Input Section */}
              <div className="p-2">
                <div className="bg-[#181a19] border border-white/5 rounded-xl p-4 flex items-center gap-3 transition-colors focus-within:border-primary/30 group">
                  <input
                    type="text"
                    placeholder="Diagnose this..."
                    className="flex-1 bg-transparent border-none outline-none text-slate-200 placeholder:text-slate-600 h-8"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                  />
                  <button
                    onClick={() => onStart()}
                    className="size-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-primary hover:text-black transition-all group-focus-within:bg-primary group-focus-within:text-black"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </div>

              {/* Actions Section */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[24px] text-white">
                      code_blocks
                    </span>
                    <span className="text-slate-300 text-sm font-medium">
                      {isGitHubConnected
                        ? `${githubRepos.length} repos available`
                        : 'Import your repos'}
                    </span>
                    {isGitHubConnected && (
                      <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                        <span className="material-symbols-outlined text-[12px]">check_circle</span>
                        Connected
                      </span>
                    )}
                  </div>
                  <Button
                    onClick={handleConnectGitHub}
                    disabled={loadingRepos}
                    className="bg-[#238636] hover:bg-[#2ea043] text-white font-medium px-4 py-2 h-9 border border-white/10 disabled:opacity-50"
                  >
                    {loadingRepos ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[16px] mr-2">
                          progress_activity
                        </span>
                        Loading...
                      </>
                    ) : isGitHubConnected ? (
                      'Select Repository'
                    ) : (
                      'Connect to GitHub'
                    )}
                  </Button>
                </div>

                {/* Show recent repos if connected */}
                {isGitHubConnected && githubRepos.length > 0 && (
                  <div className="mb-6">
                    <div className="text-xs text-slate-500 mb-3">Recent repositories:</div>
                    <div className="flex flex-wrap gap-2">
                      {githubRepos.slice(0, 5).map((repo) => (
                        <button
                          key={repo.id}
                          onClick={() => handleRepoSelect(transformToRepo(repo))}
                          className="px-3 py-1.5 rounded-md bg-[#181a19] border border-white/10 text-xs text-slate-400 hover:text-white hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center gap-2"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="size-3 fill-current"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                          </svg>
                          {repo.name}
                        </button>
                      ))}
                      {githubRepos.length > 5 && (
                        <button
                          onClick={() => setShowRepoModal(true)}
                          className="px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20 text-xs text-primary hover:bg-primary/20 transition-all"
                        >
                          +{githubRepos.length - 5} more
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {repoError && (
                  <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                    {repoError}
                  </div>
                )}

                <div className="h-px bg-white/5 w-full mb-6"></div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-2 text-slate-300 text-sm font-medium min-w-fit">
                    <span className="material-symbols-outlined text-primary text-[18px]">
                      auto_fix
                    </span>
                    Try AI CodeMate out
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['LRU cache', 'Load balancer', 'Crypto trading bot'].map((label) => (
                      <button
                        key={label}
                        onClick={() => onStart()}
                        className="px-3 py-1.5 rounded-md bg-[#181a19] border border-white/10 text-xs text-slate-400 hover:text-white hover:border-white/20 hover:bg-[#202221] transition-all"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-12 text-xs text-slate-600 max-w-lg mx-auto">
              AI CodeMate is powerful and can execute on any inputs and repositories received. For
              best results, read the{' '}
              <span className="underline cursor-pointer hover:text-slate-400">usage guide</span>.
            </p>
          </div>
        </main>

        {/* Simple Footer */}
        <footer className="py-6 text-center text-[11px] text-slate-600 flex items-center justify-center gap-6">
          <a href="#" className="hover:text-slate-400 transition-colors">
            Terms
          </a>
          <a href="#" className="hover:text-slate-400 transition-colors">
            Open source licenses
          </a>
          <a href="#" className="hover:text-slate-400 transition-colors">
            Use code with caution
          </a>
        </footer>
      </div>

      <GitHubRepoModal
        isOpen={showRepoModal}
        onClose={() => setShowRepoModal(false)}
        onSelect={handleRepoSelect}
        repos={githubRepos.map(transformToRepo)}
      />
    </>
  );
};

export default LandingPage;
