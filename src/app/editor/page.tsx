'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import EditorHeader from '@/components/editor/EditorHeader';
import EditorSidebar from '@/components/editor/EditorSidebar';
import EditorPane from '@/components/editor/EditorPane';
import RightSidebar, { SelectedElementData } from '@/components/editor/RightSidebar';

import EditorFooter from '@/components/editor/EditorFooter';
import LandingPage from '@/components/editor/LandingPage';
import { Repo } from '@/components/editor/GitHubRepoModal';
import { useRepository } from '@/hooks/useRepository';
import { DiagnosticsProvider } from '@/hooks/useDiagnostics';
import { AICommandsProvider } from '@/hooks/useAICommands';
import { ActivityLogProvider } from '@/hooks/useActivityLog';

export default function EditorPage() {
  // State for Navigation between Landing and Editor
  const [showLanding, setShowLanding] = useState(true);

  // Repository State
  const [currentRepo, setCurrentRepo] = useState<Repo | null>(null);

  // View mode - now simplified to just 'code' (preview system removed)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editorHighlightSection, setEditorHighlightSection] = useState<{
    start: number;
    end: number;
  } | null>(null);

  // Selected element state (kept for inspector compatibility, will be used by AI features)
  const [selectedElement, setSelectedElement] = useState<SelectedElementData | null>(null);

  // Repository context
  const { loadRepository, clearRepository } = useRepository();

  const startEditor = async (repo?: Repo) => {
    if (repo) {
      setCurrentRepo(repo);

      // Parse owner and repo name from the full name (e.g., "owner/repo")
      const [owner, repoName] = repo.name.split('/');
      if (owner && repoName) {
        // Load the repository file tree
        await loadRepository(owner.trim(), repoName.trim(), repo.defaultBranch);
      }
    } else {
      // Default fallback if started via "Diagnose this" without repo
      setCurrentRepo({
        id: 'demo',
        name: 'demo / project',
        description: 'Demo environment',
        stars: 0,
        language: 'TypeScript',
        updated: 'Now',
        defaultBranch: 'main',
      });
    }
    setShowLanding(false);
  };

  // Handle going back to landing
  const handleHomeClick = () => {
    clearRepository();
    setCurrentRepo(null);
    setShowLanding(true);
  };

  const handleOpenInEditor = () => {
    // In the future, this will be used by AI features to highlight code
    if (selectedElement?.tagName === 'CardComponent') {
      setEditorHighlightSection({ start: 28, end: 32 });
    }
  };

  // Resizing State deleted
  const mainRef = useRef<HTMLDivElement>(null);

  // Handle Resize Events

  // If showing landing page, render it
  if (showLanding) {
    return <LandingPage onStart={startEditor} />;
  }

  return (
    <>
      {/* Mobile/Tablet Restriction Overlay */}
      <div className="lg:hidden fixed inset-0 z-50 bg-background-dark flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 ring-1 ring-primary/30 shadow-[0_0_30px_-10px_rgba(54,226,123,0.3)]">
          <span className="material-symbols-outlined text-4xl text-primary">desktop_windows</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Desktop Access Only</h1>
        <p className="text-slate-400 max-w-md mx-auto">
          AI CodeMate is optimized for desktop development environments. Please open this
          application on a larger screen to access the full IDE experience.
        </p>
      </div>

      {/* Main Desktop Application */}
      <DiagnosticsProvider>
        <AICommandsProvider>
          <ActivityLogProvider>
            <div className="hidden lg:flex flex-col h-screen overflow-hidden font-sans bg-background-dark text-slate-300 selection:bg-primary/20 selection:text-primary animate-in fade-in duration-700">
              {/* Top Navigation - viewMode props removed since we're code-only now */}
              <EditorHeader
                viewMode="code"
                setViewMode={() => {}}
                onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
                isInspectorActive={false}
                setIsInspectorActive={() => {}}
                currentRepo={currentRepo}
                onHomeClick={handleHomeClick}
              />

              {/* Main Workspace */}
              <div className="flex flex-1 overflow-hidden relative">
                {/* Left Sidebar (File Tree) */}
                <EditorSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                {/* Center Content Area - Now just the editor (no preview wrapper needed) */}
                <main
                  ref={mainRef}
                  className="flex-1 flex flex-col min-w-0 bg-[#0d1117] relative w-full"
                >
                  {/* Editor Area - Full width now */}
                  <div className="flex-1 flex overflow-hidden relative">
                    <div className="flex-1 flex flex-col border-r border-border-dark overflow-hidden bg-[#1e1e1e]">
                      <EditorPane highlightSection={editorHighlightSection} />
                    </div>
                  </div>

                  {/* Vertical Resizer (For Terminal) */}
                </main>

                {/* Right Sidebar (AI & Inspector) */}
                <RightSidebar
                  selectedElement={selectedElement}
                  onUpdateElement={setSelectedElement}
                  onOpenInEditor={handleOpenInEditor}
                />
              </div>

              {/* Status Bar Footer */}
              <EditorFooter />
            </div>
          </ActivityLogProvider>
        </AICommandsProvider>
      </DiagnosticsProvider>
    </>
  );
}
