'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

// Diagnostic severity levels matching Monaco's MarkerSeverity
export type DiagnosticSeverity = 'error' | 'warning' | 'info' | 'hint';

export interface Diagnostic {
  message: string;
  severity: DiagnosticSeverity;
  startLine: number;
  endLine: number;
  startColumn?: number;
  endColumn?: number;
  source?: string; // e.g., 'typescript', 'python', 'json'
}

interface DiagnosticsContextType {
  // Diagnostics keyed by file path
  diagnostics: Record<string, Diagnostic[]>;
  // Computed totals
  errorCount: number;
  warningCount: number;
  infoCount: number;
  // Aggregations
  byFile: Map<string, Diagnostic[]>;
  byRule: Map<string, Diagnostic[]>;
  // Actions
  setFileDiagnostics: (path: string, items: Diagnostic[]) => void;
  clearFileDiagnostics: (path: string) => void;
  clearAllDiagnostics: () => void;
  // Get diagnostics for a specific file
  getFileDiagnostics: (path: string) => Diagnostic[];
}

const DiagnosticsContext = createContext<DiagnosticsContextType | null>(null);

export function DiagnosticsProvider({ children }: { children: ReactNode }) {
  const [diagnostics, setDiagnostics] = useState<Record<string, Diagnostic[]>>({});

  // Set diagnostics for a specific file
  const setFileDiagnostics = useCallback((path: string, items: Diagnostic[]) => {
    setDiagnostics((prev) => ({
      ...prev,
      [path]: items,
    }));
  }, []);

  // Clear diagnostics for a specific file
  const clearFileDiagnostics = useCallback((path: string) => {
    setDiagnostics((prev) => {
      const updated = { ...prev };
      delete updated[path];
      return updated;
    });
  }, []);

  // Clear all diagnostics
  const clearAllDiagnostics = useCallback(() => {
    setDiagnostics({});
  }, []);

  // Get diagnostics for a specific file
  const getFileDiagnostics = useCallback(
    (path: string): Diagnostic[] => {
      return diagnostics[path] || [];
    },
    [diagnostics]
  );

  // Compute totals across all files
  const { errorCount, warningCount, infoCount } = useMemo(() => {
    let errors = 0;
    let warnings = 0;
    let infos = 0;

    Object.values(diagnostics).forEach((fileDiags) => {
      fileDiags.forEach((diag) => {
        switch (diag.severity) {
          case 'error':
            errors++;
            break;
          case 'warning':
            warnings++;
            break;
          case 'info':
          case 'hint':
            infos++;
            break;
        }
      });
    });

    return { errorCount: errors, warningCount: warnings, infoCount: infos };
  }, [diagnostics]);

  // Compute byFile (all diagnostics grouped by file)
  const byFile = useMemo(() => {
    return new Map(Object.entries(diagnostics));
  }, [diagnostics]);

  // Compute byRule (all diagnostics grouped by source/rule)
  const byRule = useMemo(() => {
    const ruleMap = new Map<string, Diagnostic[]>();
    Object.values(diagnostics).forEach((fileDiags) => {
      fileDiags.forEach((diag) => {
        const rule = diag.source || 'unknown';
        if (!ruleMap.has(rule)) {
          ruleMap.set(rule, []);
        }
        ruleMap.get(rule)!.push(diag);
      });
    });
    return ruleMap;
  }, [diagnostics]);

  const value: DiagnosticsContextType = {
    diagnostics,
    errorCount,
    warningCount,
    infoCount,
    byFile,
    byRule,
    setFileDiagnostics,
    clearFileDiagnostics,
    clearAllDiagnostics,
    getFileDiagnostics,
  };

  return <DiagnosticsContext.Provider value={value}>{children}</DiagnosticsContext.Provider>;
}

export function useDiagnostics() {
  const context = useContext(DiagnosticsContext);
  if (!context) {
    throw new Error('useDiagnostics must be used within a DiagnosticsProvider');
  }
  return context;
}

// Monaco severity mapping helper
export function monacoSeverityToDiagnostic(severity: number): DiagnosticSeverity {
  switch (severity) {
    case 8:
      return 'error';
    case 4:
      return 'warning';
    case 2:
      return 'info';
    case 1:
      return 'hint';
    default:
      return 'info';
  }
}
