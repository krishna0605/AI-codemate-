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
  repoDetails: RepoDetails,
  readmeContent?: string | null // New argument
): string {
  const parts: string[] = [];

  // 1. Repository Info
  if (repoDetails.owner && repoDetails.name) {
    parts.push(`Current Repository: ${repoDetails.owner}/${repoDetails.name}`);
  }

  // 2. Project Description (README) - CRITICAL for "What is this project?"
  if (readmeContent) {
    parts.push(`\nProject Description (from README.md):`);
    // Truncate to save tokens (1500 chars for faster inference)
    parts.push(readmeContent.slice(0, 1500));
  }

  // 3. File Structure (Simplified)
  // We provide a list of file paths so the AI knows what exists.
  const allPaths = flattenFileTree(fileTree);
  if (allPaths.length > 0) {
    parts.push(`\nRepository Structure (First 50 files):`);
    parts.push(allPaths.slice(0, 50).join('\n'));
    if (allPaths.length > 50) {
      parts.push(`... and ${allPaths.length - 50} more files.`);
    }
  }

  // 4. Open Files (Context)
  if (openFiles.length > 0) {
    parts.push(`\nOpen Files:`);
    openFiles.forEach((f) => parts.push(`- ${f.path}`));
  }

  // 5. Active File Content
  if (currentFile) {
    parts.push(`\nActive File: ${currentFile.path}`);
    parts.push(`\`\`\`${currentFile.language}\n${currentFile.content}\n\`\`\``);
  }

  return parts.join('\n');
}
