'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useRepository } from './useRepository';
import {
  updateFile,
  fetchBranches,
  createBranch,
  fetchCommits,
  getBranchRef,
  checkFileConflict,
  fetchFileAtRef,
  compareCommits,
  GitHubCommit,
} from '@/lib/github';
import type { FileChange, CommitInfo, GitStatus } from '@/types/gitTypes';

export function useGit() {
  const { providerToken } = useAuth();
  const {
    repoOwner,
    repoName,
    defaultBranch,
    openFiles,
    updateFileAfterSave,
    resetFileContent,
    getDirtyFiles,
    currentFile,
  } = useRepository();

  const [status, setStatus] = useState<GitStatus>('clean');
  const [error, setError] = useState<string | null>(null);
  const [branches, setBranches] = useState<string[]>([]);
  const [currentBranchSha, setCurrentBranchSha] = useState<string | null>(null);
  const [commits, setCommits] = useState<CommitInfo[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Compute changed files
  const changedFiles = useMemo<FileChange[]>(() => {
    return getDirtyFiles().map((f) => ({
      path: f.path,
      status: 'modified' as const,
      originalSha: f.sha,
      content: f.content,
    }));
  }, [getDirtyFiles]);

  const hasChanges = changedFiles.length > 0;

  // Update status based on changes
  useEffect(() => {
    if (hasChanges && status === 'clean') {
      setStatus('dirty');
    } else if (!hasChanges && status === 'dirty') {
      setStatus('clean');
    }
  }, [hasChanges, status]);

  // Load commit history
  const loadCommits = useCallback(async () => {
    if (!providerToken || !repoOwner || !repoName) return;

    try {
      const data: GitHubCommit[] = await fetchCommits(
        providerToken,
        repoOwner,
        repoName,
        defaultBranch
      );

      setCommits(
        data.map((c) => ({
          sha: c.sha,
          message: c.commit.message,
          author: c.commit.author.name,
          date: new Date(c.commit.author.date),
          avatarUrl: c.author?.avatar_url,
        }))
      );

      // Store the HEAD SHA
      if (data.length > 0) {
        setCurrentBranchSha(data[0].sha);
      }
    } catch (err) {
      console.error('Failed to load commits:', err);
    }
  }, [providerToken, repoOwner, repoName, defaultBranch]);

  // Save a single file (creates a commit on GitHub)
  const saveFile = useCallback(
    async (path: string, message?: string): Promise<boolean> => {
      if (!providerToken || !repoOwner || !repoName) {
        setError('Not connected to GitHub');
        return false;
      }

      const file = openFiles.find((f) => f.path === path);
      if (!file || !file.isDirty) {
        return true; // Nothing to save
      }

      setIsSaving(true);
      setStatus('saving');
      setError(null);

      try {
        // Check for conflicts first
        const conflict = await checkFileConflict(
          providerToken,
          repoOwner,
          repoName,
          path,
          file.sha
        );

        if (conflict.hasConflict) {
          setError('File has been modified on GitHub. Please refresh to get the latest version.');
          setStatus('error');
          return false;
        }

        const result = await updateFile(
          providerToken,
          repoOwner,
          repoName,
          path,
          file.content,
          message || `Update ${path.split('/').pop()}`,
          file.sha,
          defaultBranch
        );

        // Update local state with new SHA
        updateFileAfterSave(path, result.sha);
        setStatus('clean');
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save file');
        setStatus('error');
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [providerToken, repoOwner, repoName, openFiles, defaultBranch, updateFileAfterSave]
  );

  // Save all dirty files with a commit message
  const saveAllFiles = useCallback(
    async (message: string): Promise<boolean> => {
      if (!providerToken || !repoOwner || !repoName) {
        setError('Not connected to GitHub');
        return false;
      }

      const dirtyFiles = getDirtyFiles();
      if (dirtyFiles.length === 0) {
        return true;
      }

      setIsSaving(true);
      setStatus('committing');
      setError(null);

      try {
        // Save files sequentially (GitHub Contents API limitation)
        for (const file of dirtyFiles) {
          // Check for conflict
          const conflict = await checkFileConflict(
            providerToken,
            repoOwner,
            repoName,
            file.path,
            file.sha
          );

          if (conflict.hasConflict) {
            setError(`Conflict detected in ${file.path}. Please refresh.`);
            setStatus('error');
            return false;
          }

          const result = await updateFile(
            providerToken,
            repoOwner,
            repoName,
            file.path,
            file.content,
            message,
            file.sha,
            defaultBranch
          );

          updateFileAfterSave(file.path, result.sha);
        }

        setStatus('clean');

        // Refresh commits after save
        await loadCommits();

        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save files');
        setStatus('error');
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [
      providerToken,
      repoOwner,
      repoName,
      getDirtyFiles,
      defaultBranch,
      updateFileAfterSave,
      loadCommits,
    ]
  );

  // Discard changes to a specific file
  const discardChanges = useCallback(
    (path: string) => {
      resetFileContent(path);
    },
    [resetFileContent]
  );

  // Discard all changes
  const discardAllChanges = useCallback(() => {
    const dirtyFiles = getDirtyFiles();
    dirtyFiles.forEach((f) => resetFileContent(f.path));
  }, [getDirtyFiles, resetFileContent]);

  // Load branches
  const loadBranches = useCallback(async () => {
    if (!providerToken || !repoOwner || !repoName) return;

    try {
      const data = await fetchBranches(providerToken, repoOwner, repoName);
      setBranches(data.map((b) => b.name));
    } catch (err) {
      console.error('Failed to load branches:', err);
    }
  }, [providerToken, repoOwner, repoName]);

  // Create a new branch
  const createNewBranch = useCallback(
    async (name: string): Promise<boolean> => {
      if (!providerToken || !repoOwner || !repoName) {
        setError('Not connected to GitHub');
        return false;
      }

      if (!currentBranchSha) {
        // Get current branch SHA first
        try {
          const ref = await getBranchRef(providerToken, repoOwner, repoName, defaultBranch);
          setCurrentBranchSha(ref.sha);
        } catch (err) {
          setError('Failed to get current branch reference');
          return false;
        }
      }

      try {
        await createBranch(providerToken, repoOwner, repoName, name, currentBranchSha!);
        await loadBranches();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create branch');
        return false;
      }
    },
    [providerToken, repoOwner, repoName, defaultBranch, currentBranchSha, loadBranches]
  );

  // Get file content at a specific ref (branch/commit)
  const getFileAtRef = useCallback(
    async (path: string, ref: string): Promise<string | null> => {
      if (!providerToken || !repoOwner || !repoName) return null;

      try {
        const result = await fetchFileAtRef(providerToken, repoOwner, repoName, path, ref);
        return result?.content || null;
      } catch (err) {
        console.error('Failed to fetch file at ref:', err);
        return null;
      }
    },
    [providerToken, repoOwner, repoName]
  );

  // Get the original file content from the default branch (for diffing)
  const getOriginalContent = useCallback(
    async (path: string): Promise<string | null> => {
      return getFileAtRef(path, defaultBranch);
    },
    [getFileAtRef, defaultBranch]
  );

  // Compare two commits/branches
  const getComparison = useCallback(
    async (base: string, head: string) => {
      if (!providerToken || !repoOwner || !repoName) return null;

      try {
        return await compareCommits(providerToken, repoOwner, repoName, base, head);
      } catch (err) {
        console.error('Failed to compare commits:', err);
        return null;
      }
    },
    [providerToken, repoOwner, repoName]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
    if (status === 'error') {
      setStatus(hasChanges ? 'dirty' : 'clean');
    }
  }, [status, hasChanges]);

  return {
    // State
    status,
    error,
    hasChanges,
    changedFiles,
    branches,
    commits,
    isSaving,

    // Actions
    saveFile,
    saveAllFiles,
    discardChanges,
    discardAllChanges,
    loadBranches,
    loadCommits,
    createNewBranch,
    clearError,
    getFileAtRef,
    getOriginalContent,
    getComparison,

    // Computed
    canSave: hasChanges && !isSaving,
    currentBranch: defaultBranch,
    currentFile,
  };
}
