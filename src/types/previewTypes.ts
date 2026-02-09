/**
 * Types for Preview System and Repository Eligibility
 */

export interface RuntimeEligibility {
  eligible: boolean;
  blockedBy?: string;
  reason?: string;
}

export interface RepoCapabilities {
  hasPackageJson: boolean;
  nodeVersion?: string;
  hasDockerCompose: boolean;
  hasK8sManifests: boolean;
  requiresExternalDb: boolean;
  estimatedSizeMB?: number;
  dependencyCount?: number;
  fileCount?: number;
  startScript?: string;
  staticPreview: boolean;
  runtimePreview: RuntimeEligibility;
}
