// Git-specific types for AI CodeMate

export interface FileChange {
  path: string;
  status: 'modified' | 'added' | 'deleted';
  originalSha?: string; // SHA before changes (for modified/deleted)
  content?: string; // New content (for modified/added)
}

export interface CommitInfo {
  sha: string;
  message: string;
  author: string;
  date: Date;
  avatarUrl?: string;
}

export interface BranchInfo {
  name: string;
  protected: boolean;
  current: boolean;
}

export type GitStatus =
  | 'clean' // No uncommitted changes
  | 'dirty' // Has uncommitted changes
  | 'saving' // Currently saving file(s)
  | 'committing' // Creating commit
  | 'pushing' // Pushing to remote
  | 'pulling' // Pulling from remote
  | 'error'; // Operation failed

export interface GitOperationResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ConflictInfo {
  path: string;
  localSha: string;
  remoteSha: string;
  hasConflict: boolean;
}
