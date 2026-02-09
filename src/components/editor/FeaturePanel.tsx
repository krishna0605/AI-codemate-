'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

// Learning Components
import { TutorialPlayer, TipOfTheDay, ChallengeMode } from '@/components/learning';

// Productivity Components
import { SnippetLibrary, TemplateGallery, ShortcutsPanel } from '@/components/productivity';

// Integration Components
import { APITester, DatabaseExplorer, DeploymentPanel } from '@/components/integrations';

export type FeaturePanelType = 'learn' | 'snippets' | 'integrations' | null;

interface FeaturePanelProps {
  activePanel: FeaturePanelType;
  onClose: () => void;
  onInsertSnippet?: (code: string) => void;
}

type LearnTab = 'tutorials' | 'tips' | 'challenges';
type IntegrationTab = 'api' | 'database' | 'deploy';
type SnippetTab = 'snippets' | 'templates' | 'shortcuts';

export const FeaturePanel: React.FC<FeaturePanelProps> = ({
  activePanel,
  onClose,
  onInsertSnippet,
}) => {
  const [learnTab, setLearnTab] = useState<LearnTab>('tutorials');
  const [integrationTab, setIntegrationTab] = useState<IntegrationTab>('api');
  const [snippetTab, setSnippetTab] = useState<SnippetTab>('snippets');

  if (!activePanel) return null;

  const getPanelTitle = () => {
    switch (activePanel) {
      case 'learn':
        return 'Learn & Discover';
      case 'snippets':
        return 'Code Tools';
      case 'integrations':
        return 'Integrations';
    }
  };

  const getPanelIcon = () => {
    switch (activePanel) {
      case 'learn':
        return 'school';
      case 'snippets':
        return 'data_object';
      case 'integrations':
        return 'extension';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-[500px] bg-[#1e1e1e] border-l border-[#3e3e42] z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3e3e42]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-blue-400">
              {getPanelIcon()}
            </span>
            <h2 className="text-base font-medium text-white">{getPanelTitle()}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white hover:bg-[#3e3e42] rounded transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Learn Panel */}
        {activePanel === 'learn' && (
          <>
            <div className="flex border-b border-[#3e3e42]">
              {(['tutorials', 'tips', 'challenges'] as LearnTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setLearnTab(tab)}
                  className={cn(
                    'flex-1 py-2 text-xs font-medium transition-colors',
                    learnTab === tab
                      ? 'text-white border-b-2 border-blue-500 bg-blue-500/10'
                      : 'text-gray-400 hover:text-white'
                  )}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-hidden">
              {learnTab === 'tutorials' && <TutorialPlayer />}
              {learnTab === 'tips' && <TipOfTheDay />}
              {learnTab === 'challenges' && <ChallengeMode />}
            </div>
          </>
        )}

        {/* Snippets Panel */}
        {activePanel === 'snippets' && (
          <>
            <div className="flex border-b border-[#3e3e42]">
              {(['snippets', 'templates', 'shortcuts'] as SnippetTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSnippetTab(tab)}
                  className={cn(
                    'flex-1 py-2 text-xs font-medium transition-colors',
                    snippetTab === tab
                      ? 'text-white border-b-2 border-blue-500 bg-blue-500/10'
                      : 'text-gray-400 hover:text-white'
                  )}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-hidden">
              {snippetTab === 'snippets' && <SnippetLibrary onInsertSnippet={onInsertSnippet} />}
              {snippetTab === 'templates' && <TemplateGallery />}
              {snippetTab === 'shortcuts' && <ShortcutsPanel />}
            </div>
          </>
        )}

        {/* Integrations Panel */}
        {activePanel === 'integrations' && (
          <>
            <div className="flex border-b border-[#3e3e42]">
              {(['api', 'database', 'deploy'] as IntegrationTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setIntegrationTab(tab)}
                  className={cn(
                    'flex-1 py-2 text-xs font-medium transition-colors',
                    integrationTab === tab
                      ? 'text-white border-b-2 border-blue-500 bg-blue-500/10'
                      : 'text-gray-400 hover:text-white'
                  )}
                >
                  {tab === 'api' ? 'API Tester' : tab === 'database' ? 'Database' : 'Deploy'}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-hidden">
              {integrationTab === 'api' && <APITester />}
              {integrationTab === 'database' && <DatabaseExplorer />}
              {integrationTab === 'deploy' && <DeploymentPanel />}
            </div>
          </>
        )}
      </div>
    </>
  );
};
