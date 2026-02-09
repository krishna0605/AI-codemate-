'use client';

import React, { useState } from 'react';
import { LintingDashboard } from './LintingDashboard';
import { MetricsPanel } from './MetricsPanel';
import { useDiagnostics } from '@/hooks/useDiagnostics';
import { useRepository } from '@/hooks/useRepository';
import { useAIService } from '@/contexts/AIContext';

type Tab = 'linting' | 'metrics' | 'refactor';

export const QualityTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('linting');
  const { errorCount, warningCount, getFileDiagnostics } = useDiagnostics();
  const { currentFile, updateFileContent } = useRepository();
  const { service } = useAIService();

  const [refactorSuggestions, setRefactorSuggestions] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetRefactorSuggestions = async () => {
    if (!currentFile?.content || !service) return;

    setIsLoading(true);
    try {
      // usage: Limit diagnostics to top 5 to avoid token limits
      const diagnostics = getFileDiagnostics(currentFile.path)
        .slice(0, 5)
        .map((d) => ({
          message: d.message,
          startLine: d.startLine,
          severity: d.severity,
        }));

      const response = await service.refactor(
        currentFile.content,
        currentFile.language || 'typescript',
        diagnostics
      );
      setRefactorSuggestions(response);
    } catch (error) {
      setRefactorSuggestions('Error getting suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySuggestions = () => {
    if (!currentFile || !refactorSuggestions) return;
    // Clean up markdown blocks if present
    const cleanCode = refactorSuggestions.replace(/^```[\w-]*\n|```$/g, '');
    updateFileContent(currentFile.path, cleanCode);
    setRefactorSuggestions(null); // Clear after applying
  };

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: 'linting', label: 'Issues', badge: errorCount + warningCount },
    { id: 'metrics', label: 'Metrics' },
    { id: 'refactor', label: 'AI Refactor' },
  ];

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Tab Navigation */}
      <div className="flex border-b border-[#3e3e42]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === tab.id
                ? 'bg-[#1e1e1e] text-white border-b-2 border-blue-500'
                : 'bg-[#252526] text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'linting' && <LintingDashboard />}
        {activeTab === 'metrics' && <MetricsPanel />}
        {activeTab === 'refactor' && (
          <div className="h-full flex flex-col p-4">
            <div className="mb-4">
              <button
                onClick={handleGetRefactorSuggestions}
                disabled={!currentFile || isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">
                      progress_activity
                    </span>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">auto_fix_high</span>
                    Get AI Suggestions
                  </>
                )}
              </button>
            </div>

            {!currentFile && (
              <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                <p>Open a file to get refactoring suggestions</p>
              </div>
            )}

            {currentFile && !refactorSuggestions && !isLoading && (
              <div className="flex-1 flex items-center justify-center text-gray-500 text-sm text-center p-4">
                <div>
                  <span className="material-symbols-outlined text-4xl mb-2 block">lightbulb</span>
                  <p>
                    Click the button above to get AI-powered refactoring suggestions for the current
                    file.
                  </p>
                </div>
              </div>
            )}

            {refactorSuggestions && (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="p-2 border-b border-[#3e3e42] flex items-center justify-between bg-[#252526] rounded-t">
                  <span className="text-xs font-medium text-gray-400">Suggested Changes</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setRefactorSuggestions(null)}
                      className="text-xs text-red-400 hover:text-red-300 px-2 py-1"
                    >
                      Discard
                    </button>
                    <button
                      onClick={handleApplySuggestions}
                      className="text-xs bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded"
                    >
                      Apply to Editor
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto bg-[#1e1e1e] border border-[#3e3e42] border-t-0 rounded-b p-4 text-sm text-gray-300 whitespace-pre-wrap font-mono relative">
                  {refactorSuggestions}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
