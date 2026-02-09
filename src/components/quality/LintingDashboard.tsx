'use client';

import React, { useState } from 'react';
import { useDiagnostics, Diagnostic, DiagnosticSeverity } from '@/hooks/useDiagnostics';
import { useRepository } from '@/hooks/useRepository';

type GroupBy = 'file' | 'rule';
type SeverityFilter = DiagnosticSeverity | 'all';

export const LintingDashboard: React.FC = () => {
  const { diagnostics, errorCount, warningCount, infoCount, byFile, byRule, clearAllDiagnostics } =
    useDiagnostics();
  const { selectFile } = useRepository();

  const [groupBy, setGroupBy] = useState<GroupBy>('file');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');

  const totalCount = errorCount + warningCount + infoCount;

  const filterDiagnostics = (diags: Diagnostic[]): Diagnostic[] => {
    if (severityFilter === 'all') return diags;
    return diags.filter((d) => d.severity === severityFilter);
  };

  const getSeverityColor = (severity: DiagnosticSeverity): string => {
    switch (severity) {
      case 'error':
        return 'text-red-400 bg-red-900/20';
      case 'warning':
        return 'text-yellow-400 bg-yellow-900/20';
      case 'info':
        return 'text-blue-400 bg-blue-900/20';
      case 'hint':
        return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getSeverityIcon = (severity: DiagnosticSeverity): string => {
    switch (severity) {
      case 'error':
        return 'cancel';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      case 'hint':
        return 'lightbulb';
    }
  };

  const handleDiagnosticClick = (filePath: string, line: number) => {
    selectFile(filePath);
    // TODO: scroll to line (integration with editor)
  };

  const dataSource = groupBy === 'file' ? byFile : byRule;

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-gray-300 font-sans">
      {/* Header */}
      <div className="p-4 border-b border-[#3e3e42]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Code Quality</h2>
          <button
            onClick={clearAllDiagnostics}
            className="text-xs px-2 py-1 bg-[#3e3e42] hover:bg-[#4e4e52] rounded transition-colors"
          >
            Clear All
          </button>
        </div>

        {/* Summary Cards */}
        <div className="flex gap-2">
          <div
            className={`flex-1 p-3 rounded-lg cursor-pointer transition-all ${severityFilter === 'error' ? 'ring-2 ring-red-500' : 'bg-red-900/20'}`}
            onClick={() => setSeverityFilter(severityFilter === 'error' ? 'all' : 'error')}
          >
            <div className="text-2xl font-bold text-red-400">{errorCount}</div>
            <div className="text-xs text-red-300">Errors</div>
          </div>
          <div
            className={`flex-1 p-3 rounded-lg cursor-pointer transition-all ${severityFilter === 'warning' ? 'ring-2 ring-yellow-500' : 'bg-yellow-900/20'}`}
            onClick={() => setSeverityFilter(severityFilter === 'warning' ? 'all' : 'warning')}
          >
            <div className="text-2xl font-bold text-yellow-400">{warningCount}</div>
            <div className="text-xs text-yellow-300">Warnings</div>
          </div>
          <div
            className={`flex-1 p-3 rounded-lg cursor-pointer transition-all ${severityFilter === 'info' ? 'ring-2 ring-blue-500' : 'bg-blue-900/20'}`}
            onClick={() => setSeverityFilter(severityFilter === 'info' ? 'all' : 'info')}
          >
            <div className="text-2xl font-bold text-blue-400">{infoCount}</div>
            <div className="text-xs text-blue-300">Info</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-3 border-b border-[#3e3e42] flex items-center justify-between">
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => setGroupBy('file')}
            className={`px-3 py-1.5 rounded ${groupBy === 'file' ? 'bg-blue-600 text-white' : 'bg-[#3e3e42] text-gray-300 hover:bg-[#4e4e52]'}`}
          >
            By File
          </button>
          <button
            onClick={() => setGroupBy('rule')}
            className={`px-3 py-1.5 rounded ${groupBy === 'rule' ? 'bg-blue-600 text-white' : 'bg-[#3e3e42] text-gray-300 hover:bg-[#4e4e52]'}`}
          >
            By Rule
          </button>
        </div>
        <div className="text-xs text-gray-500">{totalCount} issues</div>
      </div>

      {/* Diagnostics List */}
      <div className="flex-1 overflow-y-auto">
        {totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <span className="material-symbols-outlined text-5xl text-green-400 mb-2">
              check_circle
            </span>
            <p className="text-lg font-medium text-green-400">No Issues Found</p>
            <p className="text-xs text-gray-500 mt-1">Your code is looking great!</p>
          </div>
        ) : (
          Array.from(dataSource.entries()).map(([key, items]) => {
            const filtered = filterDiagnostics(items);
            if (filtered.length === 0) return null;

            return (
              <div key={key} className="border-b border-[#3e3e42]">
                <div className="p-3 bg-[#252526] text-xs text-gray-400 font-mono flex items-center justify-between">
                  <span className="truncate" title={key}>
                    {key.split('/').pop() || key}
                  </span>
                  <span className="bg-[#3e3e42] px-2 py-0.5 rounded">{filtered.length}</span>
                </div>
                <div>
                  {filtered.map((diag, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        // When grouped by rule, we need to find the file path
                        const filePath =
                          groupBy === 'file' ? key : findFileForDiagnostic(diagnostics, diag);
                        if (filePath) handleDiagnosticClick(filePath, diag.startLine);
                      }}
                      className="px-4 py-2 hover:bg-[#2a2d2e] cursor-pointer flex items-start gap-2 group"
                    >
                      <span
                        className={`material-symbols-outlined text-[16px] mt-0.5 ${getSeverityColor(diag.severity).split(' ')[0]}`}
                      >
                        {getSeverityIcon(diag.severity)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-200">{diag.message}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <span>Line {diag.startLine}</span>
                          {diag.source && <span className="text-blue-400">{diag.source}</span>}
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-[14px] text-gray-500 opacity-0 group-hover:opacity-100">
                        arrow_forward
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// Helper to find file path when grouped by rule
function findFileForDiagnostic(
  diagnostics: Record<string, Diagnostic[]>,
  diag: Diagnostic
): string | null {
  for (const [path, items] of Object.entries(diagnostics)) {
    if (items.includes(diag)) return path;
  }
  return null;
}
