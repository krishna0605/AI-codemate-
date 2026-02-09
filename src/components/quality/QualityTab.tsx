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
  const { errorCount, warningCount } = useDiagnostics();
  const { currentFile } = useRepository();
  const { service } = useAIService();

  const [refactorSuggestions, setRefactorSuggestions] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetRefactorSuggestions = async () => {
    if (!currentFile?.content || !service) return;

    setIsLoading(true);
    try {
      const response = await service.refactor(
        currentFile.content,
        currentFile.language || 'typescript'
      );
      setRefactorSuggestions(response);
    } catch (error) {
      setRefactorSuggestions('Error getting suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
              <div className="flex-1 overflow-y-auto bg-[#252526] rounded p-4 text-sm text-gray-300 whitespace-pre-wrap font-mono">
                {refactorSuggestions}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
