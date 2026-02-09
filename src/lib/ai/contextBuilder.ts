import { FileTreeNode } from '@/lib/github';
import { OpenFile } from '@/hooks/useRepository';

interface RepoDetails {
  owner: string | null;
  name: string | null;
}

/**
 * flattenFileTree converts a hierarchical file tree into a list of paths
 * to save tokens while still giving the AI a sense of structure.
 * It strictly limits the number of files to avoid context overflow.
 */
function flattenFileTree(nodes: FileTreeNode[], maxFiles = 200): string[] {
  const paths: string[] = [];

  function traverse(nodeList: FileTreeNode[]) {
    for (const node of nodeList) {
      if (paths.length >= maxFiles) return;

      if (node.type === 'file') {
        paths.push(node.path);
      } else if (node.children) {
        traverse(node.children);
      }
    }
  }

  traverse(nodes);
  return paths;
}

export function buildContextPrompt(
  fileTree: FileTreeNode[],
  openFiles: OpenFile[],
  currentFile: OpenFile | null,
  repoDetails: RepoDetails
): string {
  const parts: string[] = [];

  // 1. Repository Info
  if (repoDetails.owner && repoDetails.name) {
    parts.push(`Current Repository: ${repoDetails.owner}/${repoDetails.name}`);
  }

  // 2. File Structure (Simplified)
  // We provide a list of file paths so the AI knows what exists.
  const allPaths = flattenFileTree(fileTree);
  if (allPaths.length > 0) {
    parts.push(`\nRepository Structure (First ${allPaths.length} files):`);
    parts.push(allPaths.slice(0, 50).join('\n')); // Only show first 50 to save tokens, or maybe more?
    // Let's show a tree-like structure or just paths. Paths are token-heavy.
    // Let's try to be smart. If there are too many, just show the top levels?
    // For now, listing paths is the most accurate way for "tell me about this repo".
    // I'll limit to 100 paths.
    if (allPaths.length > 50) {
      parts.push(`... and ${allPaths.length - 50} more files.`);
    }
  }

  // 3. Open Files (Context)
  // These are files the user is working on, so they are high priority context.
  if (openFiles.length > 0) {
    parts.push(`\nOpen Files:`);
    openFiles.forEach((f) => parts.push(`- ${f.path}`));
  }

  // 4. Active File Content
  // This is the MOST important context (cursor location).
  if (currentFile) {
    parts.push(`\nActive File: ${currentFile.path}`);
    parts.push(`\`\`\`${currentFile.language}\n${currentFile.content}\n\`\`\``);
  }

  return parts.join('\n');
}
