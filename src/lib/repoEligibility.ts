// Repository Eligibility Scanner for Runtime Preview

import {
  RUNTIME_LIMITS,
  EXTERNAL_DB_PACKAGES,
  ALLOWED_DB_PACKAGES,
  BLOCKING_FILE_PATTERNS,
} from './previewConstants';
import type { RepoCapabilities, RuntimeEligibility } from '@/types/previewTypes';
import type { FileTreeNode } from './github';

/**
 * Scan a repository's file tree and package.json to determine preview capabilities
 */
export function scanRepoCapabilities(
  fileTree: FileTreeNode[],
  packageJsonContent?: string
): RepoCapabilities {
  // 1. Check for package.json
  const hasPackageJson = fileTree.some((f) => f.path === 'package.json');

  // 2. Parse package.json if available
  let pkg: any = null;
  if (packageJsonContent) {
    try {
      pkg = JSON.parse(packageJsonContent);
    } catch {
      // Invalid JSON, treat as no package.json
    }
  }

  // 3. Detect blocking files
  const hasDockerCompose = fileTree.some((f) =>
    BLOCKING_FILE_PATTERNS.dockerCompose.some((pattern) =>
      f.path.toLowerCase().includes(pattern.toLowerCase())
    )
  );

  const hasK8sManifests = fileTree.some((f) =>
    BLOCKING_FILE_PATTERNS.kubernetes.some((pattern) =>
      f.path.toLowerCase().includes(pattern.toLowerCase())
    )
  );

  // 4. Check for external DB dependencies
  const requiresExternalDb = pkg ? hasExternalDbDependency(pkg) : false;

  // 5. Calculate metrics
  const fileCount = countFiles(fileTree);
  const dependencyCount = pkg ? countDependencies(pkg) : 0;
  const estimatedSizeMB = estimateRepoSize(fileTree);

  // 6. Detect start script (priority per blueprint)
  const startScript = pkg ? detectStartScript(pkg) : undefined;

  // 7. Get Node version if specified
  const nodeVersion = pkg?.engines?.node;

  // 8. Build eligibility result
  const runtimePreview = evaluateRuntimeEligibility({
    hasPackageJson,
    hasDockerCompose,
    hasK8sManifests,
    requiresExternalDb,
    estimatedSizeMB,
    dependencyCount,
    fileCount,
    startScript,
  });

  return {
    hasPackageJson,
    nodeVersion,
    hasDockerCompose,
    hasK8sManifests,
    requiresExternalDb,
    estimatedSizeMB,
    dependencyCount,
    fileCount,
    startScript,
    staticPreview: true, // Always available
    runtimePreview,
  };
}

/**
 * Detect the best start script for the project
 * Priority: npm run dev > npm start > node main
 */
function detectStartScript(pkg: any): string | undefined {
  const scripts = pkg.scripts || {};

  // Check for dev script first (most common for development)
  if (scripts['dev']) return 'npm run dev';

  // Then start script
  if (scripts['start']) return 'npm start';

  // Then check for main entry point
  if (pkg.main && pkg.main.endsWith('.js')) {
    return `node ${pkg.main}`;
  }

  // Check for common patterns
  if (scripts['serve']) return 'npm run serve';
  if (scripts['develop']) return 'npm run develop';

  return undefined;
}

/**
 * Check if package.json has external database dependencies
 */
function hasExternalDbDependency(pkg: any): boolean {
  const allDeps: Record<string, string> = {
    ...(pkg.dependencies || {}),
    ...(pkg.devDependencies || {}),
  };

  const depNames = Object.keys(allDeps);

  // Check for external DB packages
  const hasExternal = EXTERNAL_DB_PACKAGES.some((dbPkg) => depNames.includes(dbPkg));

  // If has external, check if also has allowed in-memory DB
  // (having an allowed package doesn't override the external requirement)
  if (hasExternal) {
    // Check if ONLY using Prisma with SQLite (allowed)
    const hasPrisma = depNames.includes('@prisma/client');
    const hasNoOtherExternal = !EXTERNAL_DB_PACKAGES.filter((p) => p !== '@prisma/client').some(
      (dbPkg) => depNames.includes(dbPkg)
    );

    // If only Prisma and no other external DBs, we need to check prisma schema
    // For now, assume external DB is required if any external package is present
    return true;
  }

  return false;
}

/**
 * Count total number of files in the tree
 */
function countFiles(nodes: FileTreeNode[]): number {
  let count = 0;

  function traverse(node: FileTreeNode) {
    if (node.type === 'file') {
      count++;
    }
    if (node.children) {
      node.children.forEach(traverse);
    }
  }

  nodes.forEach(traverse);
  return count;
}

/**
 * Count total dependencies (dependencies + devDependencies)
 */
function countDependencies(pkg: any): number {
  const deps = Object.keys(pkg.dependencies || {}).length;
  const devDeps = Object.keys(pkg.devDependencies || {}).length;
  return deps + devDeps;
}

/**
 * Estimate repo size in MB based on file tree
 * Uses file sizes from GitHub API if available
 */
function estimateRepoSize(nodes: FileTreeNode[]): number {
  let totalBytes = 0;

  function traverse(node: FileTreeNode) {
    if (node.type === 'file' && node.size) {
      totalBytes += node.size;
    }
    if (node.children) {
      node.children.forEach(traverse);
    }
  }

  nodes.forEach(traverse);

  // Convert to MB
  return totalBytes / (1024 * 1024);
}

/**
 * Evaluate runtime eligibility based on capabilities
 */
function evaluateRuntimeEligibility(caps: Partial<RepoCapabilities>): RuntimeEligibility {
  // Must have package.json
  if (!caps.hasPackageJson) {
    return {
      eligible: false,
      blockedBy: 'no-package-json',
      reason: 'No package.json found. Runtime preview requires a Node.js project.',
    };
  }

  // Cannot have docker-compose
  if (caps.hasDockerCompose) {
    return {
      eligible: false,
      blockedBy: 'docker-compose',
      reason: 'docker-compose.yml detected. Multi-container apps are not supported.',
    };
  }

  // Cannot have Kubernetes manifests
  if (caps.hasK8sManifests) {
    return {
      eligible: false,
      blockedBy: 'k8s-manifests',
      reason: 'Kubernetes manifests detected. Cluster deployments are not supported.',
    };
  }

  // Cannot require external database
  if (caps.requiresExternalDb) {
    return {
      eligible: false,
      blockedBy: 'external-db',
      reason: 'External database required (PostgreSQL, MongoDB, Redis, etc.).',
    };
  }

  // Check repo size limit
  if ((caps.estimatedSizeMB || 0) > RUNTIME_LIMITS.MAX_REPO_SIZE_MB) {
    return {
      eligible: false,
      blockedBy: 'repo-too-large',
      reason: `Repository exceeds ${RUNTIME_LIMITS.MAX_REPO_SIZE_MB}MB size limit.`,
    };
  }

  // Check dependency count limit
  if ((caps.dependencyCount || 0) > RUNTIME_LIMITS.MAX_DEPENDENCY_COUNT) {
    return {
      eligible: false,
      blockedBy: 'too-many-deps',
      reason: `Exceeds ${RUNTIME_LIMITS.MAX_DEPENDENCY_COUNT} dependencies limit.`,
    };
  }

  // Check file count limit
  if ((caps.fileCount || 0) > RUNTIME_LIMITS.MAX_FILE_COUNT) {
    return {
      eligible: false,
      blockedBy: 'too-many-files',
      reason: `Exceeds ${RUNTIME_LIMITS.MAX_FILE_COUNT} files limit.`,
    };
  }

  // Must have a start script
  if (!caps.startScript) {
    return {
      eligible: false,
      blockedBy: 'no-start-script',
      reason: 'No start script detected (dev, start, or main entry).',
    };
  }

  // All checks passed
  return { eligible: true };
}

/**
 * Check if the browser supports WebContainers
 */
export function checkBrowserSupport(): boolean {
  if (typeof window === 'undefined') return false;

  const ua = navigator.userAgent;

  // WebContainers only work in Chromium-based browsers
  const isChromium = /Chrome|Chromium|Edg|Brave/i.test(ua);
  const isNotFirefox = !/Firefox/i.test(ua);
  const isNotSafari = !/Safari/i.test(ua) || /Chrome/i.test(ua); // Chrome includes Safari string

  return isChromium && isNotFirefox && isNotSafari;
}

/**
 * Get a human-readable summary of why runtime is blocked
 */
export function getBlockedReason(eligibility: RuntimeEligibility): string {
  if (eligibility.eligible) return '';
  return eligibility.reason || 'Runtime preview not available for this repository.';
}
