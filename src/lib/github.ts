// GitHub API Service - Fetch user repositories using GitHub access token

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  updated_at: string;
  default_branch: string;
  private: boolean;
  owner: {
    login: string;
    avatar_url: string;
  };
}

// Tree node types for file structure
export interface GitHubTreeNode {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

export interface GitHubTree {
  sha: string;
  url: string;
  tree: GitHubTreeNode[];
  truncated: boolean;
}

// Processed file tree for UI
export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  sha: string;
  size?: number;
  children?: FileTreeNode[];
}

// File content response
export interface GitHubFileContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  content: string;
  encoding: 'base64';
}

/**
 * Fetch user's GitHub repositories using the provider access token
 */
export async function fetchGitHubRepos(accessToken: string): Promise<GitHubRepo[]> {
  const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=50', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch repos: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch a specific repository's details
 */
export async function fetchGitHubRepo(
  accessToken: string,
  owner: string,
  repo: string
): Promise<GitHubRepo> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch repo: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch the file tree for a repository (recursive)
 */
export async function fetchRepoTree(
  accessToken: string,
  owner: string,
  repo: string,
  branch: string = 'main'
): Promise<FileTreeNode[]> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );

  if (!response.ok) {
    // Try with 'master' if 'main' fails
    if (branch === 'main') {
      return fetchRepoTree(accessToken, owner, repo, 'master');
    }
    throw new Error(`Failed to fetch tree: ${response.statusText}`);
  }

  const data: GitHubTree = await response.json();
  return buildFileTree(data.tree);
}

/**
 * Build a hierarchical file tree from flat GitHub tree data
 */
function buildFileTree(nodes: GitHubTreeNode[]): FileTreeNode[] {
  const root: FileTreeNode[] = [];
  const map = new Map<string, FileTreeNode>();

  // Sort nodes so folders come before their contents
  const sortedNodes = [...nodes].sort((a, b) => {
    const aDepth = a.path.split('/').length;
    const bDepth = b.path.split('/').length;
    return aDepth - bDepth;
  });

  for (const node of sortedNodes) {
    const parts = node.path.split('/');
    const name = parts[parts.length - 1];

    const treeNode: FileTreeNode = {
      name,
      path: node.path,
      type: node.type === 'tree' ? 'folder' : 'file',
      sha: node.sha,
      size: node.size,
      children: node.type === 'tree' ? [] : undefined,
    };

    map.set(node.path, treeNode);

    if (parts.length === 1) {
      // Top-level item
      root.push(treeNode);
    } else {
      // Find parent
      const parentPath = parts.slice(0, -1).join('/');
      const parent = map.get(parentPath);
      if (parent && parent.children) {
        parent.children.push(treeNode);
      }
    }
  }

  // Sort: folders first, then alphabetically
  const sortTree = (nodes: FileTreeNode[]): FileTreeNode[] => {
    return nodes
      .sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'folder' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      })
      .map((node) => ({
        ...node,
        children: node.children ? sortTree(node.children) : undefined,
      }));
  };

  return sortTree(root);
}

/**
 * Fetch content of a specific file
 * Returns both the decoded content and the file's SHA (needed for updates)
 */
export async function fetchFileContent(
  accessToken: string,
  owner: string,
  repo: string,
  path: string
): Promise<{ content: string; sha: string }> {
  // Add 15s timeout to prevent infinite loading
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`File not found: ${path}`);
      }
      if (response.status === 403) {
        throw new Error('Access denied (403). Check your token permissions.');
      }
      throw new Error(`Failed to fetch file (${response.status}): ${response.statusText}`);
    }

    const data: GitHubFileContent = await response.json();

    // Decode base64 content and return with SHA
    return {
      content: decodeBase64(data.content),
      sha: data.sha,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your internet connection.');
      }
    }
    throw error;
  }
}

/**
 * Decode base64 content (handles Unicode)
 */
function decodeBase64(base64: string): string {
  // Remove line breaks that GitHub adds
  const cleaned = base64.replace(/\n/g, '');

  // Handle UTF-8 properly
  try {
    return decodeURIComponent(
      atob(cleaned)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch {
    // Fallback for non-UTF-8 content
    return atob(cleaned);
  }
}

/**
 * Get Monaco language from file extension
 */
export function getLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() || '';

  const languageMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    py: 'python',
    rb: 'ruby',
    java: 'java',
    go: 'go',
    rs: 'rust',
    c: 'c',
    cpp: 'cpp',
    h: 'c',
    hpp: 'cpp',
    cs: 'csharp',
    php: 'php',
    swift: 'swift',
    kt: 'kotlin',
    scala: 'scala',
    html: 'html',
    htm: 'html',
    css: 'css',
    scss: 'scss',
    less: 'less',
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    xml: 'xml',
    md: 'markdown',
    markdown: 'markdown',
    sql: 'sql',
    sh: 'shell',
    bash: 'shell',
    zsh: 'shell',
    dockerfile: 'dockerfile',
    graphql: 'graphql',
    vue: 'vue',
    svelte: 'svelte',
  };

  return languageMap[ext] || 'plaintext';
}

/**
 * Format relative time for repo updates
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

/**
 * Get file icon based on file extension
 */
export function getFileIcon(path: string): { icon: string; color: string } {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  const name = path.split('/').pop()?.toLowerCase() || '';

  // Special files
  if (name === 'package.json') return { icon: 'inventory_2', color: 'text-red-400' };
  if (name === 'tsconfig.json') return { icon: 'settings', color: 'text-blue-400' };
  if (name === '.gitignore') return { icon: 'visibility_off', color: 'text-gray-400' };
  if (name === 'readme.md') return { icon: 'description', color: 'text-blue-300' };
  if (name === 'dockerfile') return { icon: 'deployed_code', color: 'text-blue-500' };

  const iconMap: Record<string, { icon: string; color: string }> = {
    ts: { icon: 'javascript', color: 'text-blue-400' },
    tsx: { icon: 'javascript', color: 'text-blue-400' },
    js: { icon: 'javascript', color: 'text-yellow-400' },
    jsx: { icon: 'javascript', color: 'text-yellow-400' },
    py: { icon: 'code', color: 'text-blue-500' },
    json: { icon: 'data_object', color: 'text-yellow-300' },
    html: { icon: 'html', color: 'text-orange-500' },
    css: { icon: 'css', color: 'text-blue-500' },
    scss: { icon: 'css', color: 'text-pink-400' },
    md: { icon: 'markdown', color: 'text-white' },
    svg: { icon: 'image', color: 'text-yellow-500' },
    png: { icon: 'image', color: 'text-purple-400' },
    jpg: { icon: 'image', color: 'text-purple-400' },
    gif: { icon: 'gif', color: 'text-green-400' },
  };

  return iconMap[ext] || { icon: 'draft', color: 'text-slate-400' };
}

// ─────────────────────────────────────────────────────────────────────────────
// GIT WRITE OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Encode content to base64 (UTF-8 safe)
 */
function encodeBase64(content: string): string {
  return btoa(unescape(encodeURIComponent(content)));
}

/**
 * Create or update a file in the repository.
 * For updates, the file's current SHA is required to prevent overwriting.
 * Each call creates a new commit.
 */
export async function updateFile(
  accessToken: string,
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  sha?: string, // Required for updates, undefined for new files
  branch?: string
): Promise<{ sha: string; commit: { sha: string; html_url: string } }> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      content: encodeBase64(content),
      sha,
      branch,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 409) {
      throw new Error('File has been modified on GitHub. Please refresh and try again.');
    }
    throw new Error(error.message || `Failed to update file: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    sha: data.content.sha,
    commit: {
      sha: data.commit.sha,
      html_url: data.commit.html_url,
    },
  };
}

/**
 * Delete a file from the repository
 */
export async function deleteFile(
  accessToken: string,
  owner: string,
  repo: string,
  path: string,
  sha: string,
  message: string,
  branch?: string
): Promise<{ commit: { sha: string } }> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, sha, branch }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete file');
  }

  return response.json();
}

/**
 * Fetch all branches for a repository
 */
export async function fetchBranches(
  accessToken: string,
  owner: string,
  repo: string
): Promise<{ name: string; protected: boolean }[]> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch branches: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Create a new branch from a specific commit SHA
 */
export async function createBranch(
  accessToken: string,
  owner: string,
  repo: string,
  branchName: string,
  fromSha: string
): Promise<{ ref: string; object: { sha: string } }> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ref: `refs/heads/${branchName}`,
      sha: fromSha,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 422) {
      throw new Error(`Branch "${branchName}" already exists`);
    }
    throw new Error(error.message || 'Failed to create branch');
  }

  return response.json();
}

/**
 * Get the current branch reference (HEAD SHA)
 */
export async function getBranchRef(
  accessToken: string,
  owner: string,
  repo: string,
  branch: string
): Promise<{ sha: string; url: string }> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get branch ref: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    sha: data.object.sha,
    url: data.object.url,
  };
}

/**
 * GitHub commit response type
 */
export interface GitHubCommit {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  author?: {
    login: string;
    avatar_url: string;
  };
}

/**
 * Fetch commit history for a branch
 */
export async function fetchCommits(
  accessToken: string,
  owner: string,
  repo: string,
  branch: string,
  limit: number = 20
): Promise<GitHubCommit[]> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/commits?sha=${branch}&per_page=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch commits: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Check if a file has been modified on the remote
 * Used for conflict detection before save
 */
export async function checkFileConflict(
  accessToken: string,
  owner: string,
  repo: string,
  path: string,
  localSha: string
): Promise<{ hasConflict: boolean; remoteSha?: string }> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      // File might be new or deleted, no conflict
      return { hasConflict: false };
    }

    const data: GitHubFileContent = await response.json();
    return {
      hasConflict: data.sha !== localSha,
      remoteSha: data.sha,
    };
  } catch {
    return { hasConflict: false };
  }
}

/**
 * Fetch file content at a specific ref (branch name or commit SHA)
 * Used for viewing historical versions and comparing diffs
 */
export async function fetchFileAtRef(
  accessToken: string,
  owner: string,
  repo: string,
  path: string,
  ref: string
): Promise<{ content: string; sha: string } | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${ref}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      // File might not exist at this ref
      return null;
    }

    const data: GitHubFileContent = await response.json();
    return {
      content: decodeBase64(data.content),
      sha: data.sha,
    };
  } catch {
    return null;
  }
}

/**
 * Compare two commits to get the diff
 */
export async function compareCommits(
  accessToken: string,
  owner: string,
  repo: string,
  base: string,
  head: string
): Promise<{
  files: {
    filename: string;
    status: 'added' | 'removed' | 'modified' | 'renamed';
    additions: number;
    deletions: number;
    patch?: string;
  }[];
  total_commits: number;
  ahead_by: number;
  behind_by: number;
}> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/compare/${base}...${head}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to compare commits: ${response.statusText}`);
  }

  return response.json();
}
