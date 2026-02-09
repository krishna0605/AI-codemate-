'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { FileTreeNode, fetchRepoTree, fetchFileContent, getLanguageFromPath } from '@/lib/github';
import { useAuth } from './useAuth';

// Types
export interface OpenFile {
  path: string;
  content: string;
  language: string;
  isDirty: boolean;
  sha: string; // File SHA from GitHub (needed for updates)
  originalContent: string; // Original content for diff/reset
}

interface RepositoryContextType {
  // Repository info
  repoOwner: string | null;
  repoName: string | null;
  defaultBranch: string;

  // File tree
  fileTree: FileTreeNode[];
  isLoadingTree: boolean;
  treeError: string | null;

  // Currently selected file
  selectedFilePath: string | null;
  currentFile: OpenFile | null;
  isLoadingFile: boolean;
  fileError: string | null;

  // Open tabs
  openFiles: OpenFile[];

  // All previewable files
  allPreviewableFiles: Map<string, string>;
  isLoadingPreviewFiles: boolean;

  // Actions
  loadRepository: (owner: string, repo: string, branch?: string) => Promise<void>;
  selectFile: (path: string) => Promise<void>;
  closeFile: (path: string) => void;
  updateFileContent: (path: string, content: string) => void;
  clearRepository: () => void;
  loadAllPreviewableFiles: () => Promise<void>;

  // Git operations support
  updateFileAfterSave: (path: string, newSha: string) => void;
  resetFileContent: (path: string) => void;
  getDirtyFiles: () => OpenFile[];
}

const RepositoryContext = createContext<RepositoryContextType | undefined>(undefined);

export function RepositoryProvider({ children }: { children: ReactNode }) {
  const { providerToken } = useAuth();

  // Repository state
  const [repoOwner, setRepoOwner] = useState<string | null>(null);
  const [repoName, setRepoName] = useState<string | null>(null);
  const [defaultBranch, setDefaultBranch] = useState<string>('main');

  // File tree state
  const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);
  const [isLoadingTree, setIsLoadingTree] = useState(false);
  const [treeError, setTreeError] = useState<string | null>(null);

  // File content state
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<OpenFile | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // Open files/tabs
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);

  // File content cache (stores content and SHA)
  const [fileCache, setFileCache] = useState<Map<string, { content: string; sha: string }>>(
    new Map()
  );

  // All previewable files
  const [allPreviewableFiles, setAllPreviewableFiles] = useState<Map<string, string>>(new Map());
  const [isLoadingPreviewFiles, setIsLoadingPreviewFiles] = useState(false);

  const loadRepository = useCallback(
    async (owner: string, repo: string, branch: string = 'main') => {
      if (!providerToken) {
        setTreeError('Not authenticated with GitHub');
        return;
      }

      setIsLoadingTree(true);
      setTreeError(null);
      setRepoOwner(owner);
      setRepoName(repo);
      setDefaultBranch(branch);

      // Clear previous state
      setFileTree([]);
      setOpenFiles([]);
      setCurrentFile(null);
      setSelectedFilePath(null);
      setFileCache(new Map());

      try {
        const tree = await fetchRepoTree(providerToken, owner, repo, branch);
        setFileTree(tree);
      } catch (error) {
        console.error('Failed to load repository:', error);
        setTreeError(error instanceof Error ? error.message : 'Failed to load repository');
      } finally {
        setIsLoadingTree(false);
      }
    },
    [providerToken]
  );

  const selectFile = useCallback(
    async (path: string) => {
      if (!providerToken || !repoOwner || !repoName) {
        setFileError('Repository not loaded');
        return;
      }

      setSelectedFilePath(path);
      setFileError(null);

      // Check if file is already open
      const existingFile = openFiles.find((f) => f.path === path);
      if (existingFile) {
        setCurrentFile(existingFile);
        return;
      }

      // Check cache
      const cached = fileCache.get(path);
      if (cached) {
        const file: OpenFile = {
          path,
          content: cached.content,
          language: getLanguageFromPath(path),
          isDirty: false,
          sha: cached.sha,
          originalContent: cached.content,
        };
        setCurrentFile(file);
        setOpenFiles((prev) => [...prev, file]);
        return;
      }

      // Fetch from GitHub
      setIsLoadingFile(true);
      try {
        const { content, sha } = await fetchFileContent(providerToken, repoOwner, repoName, path);

        // Cache the content and SHA
        setFileCache((prev) => new Map(prev).set(path, { content, sha }));

        const file: OpenFile = {
          path,
          content,
          language: getLanguageFromPath(path),
          isDirty: false,
          sha,
          originalContent: content,
        };

        setCurrentFile(file);
        setOpenFiles((prev) => [...prev, file]);
      } catch (error) {
        console.error('Failed to load file:', error);
        setFileError(error instanceof Error ? error.message : 'Failed to load file');
      } finally {
        setIsLoadingFile(false);
      }
    },
    [providerToken, repoOwner, repoName, openFiles, fileCache]
  );

  const closeFile = useCallback(
    (path: string) => {
      setOpenFiles((prev) => {
        const updated = prev.filter((f) => f.path !== path);

        // If closing current file, switch to last open file
        if (selectedFilePath === path && updated.length > 0) {
          const lastFile = updated[updated.length - 1];
          setSelectedFilePath(lastFile.path);
          setCurrentFile(lastFile);
        } else if (updated.length === 0) {
          setSelectedFilePath(null);
          setCurrentFile(null);
        }

        return updated;
      });
    },
    [selectedFilePath]
  );

  const updateFileContent = useCallback(
    (path: string, content: string) => {
      setOpenFiles((prev) =>
        prev.map((f) => (f.path === path ? { ...f, content, isDirty: true } : f))
      );

      if (currentFile?.path === path) {
        setCurrentFile((prev) => (prev ? { ...prev, content, isDirty: true } : null));
      }
    },
    [currentFile?.path]
  );

  const clearRepository = useCallback(() => {
    setRepoOwner(null);
    setRepoName(null);
    setFileTree([]);
    setOpenFiles([]);
    setCurrentFile(null);
    setSelectedFilePath(null);
    setFileCache(new Map());
    setTreeError(null);
    setFileError(null);
  }, []);

  // Git operations support
  const updateFileAfterSave = useCallback(
    (path: string, newSha: string) => {
      setOpenFiles((prev) =>
        prev.map((f) =>
          f.path === path ? { ...f, sha: newSha, isDirty: false, originalContent: f.content } : f
        )
      );

      // Update cache with new SHA
      setFileCache((prev) => {
        const existing = prev.get(path);
        if (existing) {
          const updated = new Map(prev);
          updated.set(path, { content: existing.content, sha: newSha });
          return updated;
        }
        return prev;
      });

      // Update current file if it's the saved one
      if (currentFile?.path === path) {
        setCurrentFile((prev) =>
          prev ? { ...prev, sha: newSha, isDirty: false, originalContent: prev.content } : null
        );
      }
    },
    [currentFile?.path]
  );

  const resetFileContent = useCallback(
    (path: string) => {
      setOpenFiles((prev) =>
        prev.map((f) =>
          f.path === path ? { ...f, content: f.originalContent, isDirty: false } : f
        )
      );

      if (currentFile?.path === path) {
        setCurrentFile((prev) =>
          prev ? { ...prev, content: prev.originalContent, isDirty: false } : null
        );
      }
    },
    [currentFile?.path]
  );

  const getDirtyFiles = useCallback(() => {
    return openFiles.filter((f) => f.isDirty);
  }, [openFiles]);

  // Helper to get all file paths from the tree
  const getAllFilePaths = useCallback((nodes: FileTreeNode[], extensions: string[]): string[] => {
    const paths: string[] = [];
    const traverse = (nodeList: FileTreeNode[]) => {
      for (const node of nodeList) {
        if (node.type === 'file') {
          const ext = '.' + node.path.split('.').pop()?.toLowerCase();
          if (extensions.includes(ext)) {
            paths.push(node.path);
          }
        } else if (node.children) {
          traverse(node.children);
        }
      }
    };
    traverse(nodes);
    return paths;
  }, []);

  // Load all previewable files
  const loadAllPreviewableFiles = useCallback(async () => {
    if (!providerToken || !repoOwner || !repoName || fileTree.length === 0) {
      return;
    }

    const PREVIEWABLE_EXTENSIONS = [
      '.js',
      '.jsx',
      '.ts',
      '.tsx',
      '.mjs',
      '.cjs',
      '.css',
      '.scss',
      '.sass',
      '.less',
      '.html',
      '.htm',
      '.json',
    ];

    setIsLoadingPreviewFiles(true);

    try {
      const filePaths = getAllFilePaths(fileTree, PREVIEWABLE_EXTENSIONS);

      // Limit to first 50 files to avoid rate limiting
      const limitedPaths = filePaths.slice(0, 50);

      const files = new Map<string, string>();

      // Fetch files in batches of 5 to avoid rate limiting
      const BATCH_SIZE = 5;
      for (let i = 0; i < limitedPaths.length; i += BATCH_SIZE) {
        const batch = limitedPaths.slice(i, i + BATCH_SIZE);

        const results = await Promise.allSettled(
          batch.map(async (path) => {
            // Check cache first
            const cached = fileCache.get(path);
            if (cached) {
              return { path, content: cached.content };
            }

            // Fetch from GitHub
            const { content, sha } = await fetchFileContent(
              providerToken,
              repoOwner,
              repoName,
              path
            );
            // Update cache
            setFileCache((prev) => new Map(prev).set(path, { content, sha }));
            return { path, content };
          })
        );

        for (const result of results) {
          if (result.status === 'fulfilled') {
            files.set(result.value.path, result.value.content);
          }
        }
      }

      setAllPreviewableFiles(files);
    } catch (error) {
      console.error('Failed to load previewable files:', error);
    } finally {
      setIsLoadingPreviewFiles(false);
    }
  }, [providerToken, repoOwner, repoName, fileTree, fileCache, getAllFilePaths]);

  return (
    <RepositoryContext.Provider
      value={{
        repoOwner,
        repoName,
        defaultBranch,
        fileTree,
        isLoadingTree,
        treeError,
        selectedFilePath,
        currentFile,
        isLoadingFile,
        fileError,
        openFiles,
        allPreviewableFiles,
        isLoadingPreviewFiles,
        loadRepository,
        selectFile,
        closeFile,
        updateFileContent,
        clearRepository,
        loadAllPreviewableFiles,
        updateFileAfterSave,
        resetFileContent,
        getDirtyFiles,
      }}
    >
      {children}
    </RepositoryContext.Provider>
  );
}

export function useRepository() {
  const context = useContext(RepositoryContext);
  if (context === undefined) {
    throw new Error('useRepository must be used within a RepositoryProvider');
  }
  return context;
}
