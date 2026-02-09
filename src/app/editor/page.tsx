'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import EditorHeader from '@/components/editor/EditorHeader';
import EditorSidebar from '@/components/editor/EditorSidebar';
import EditorPane from '@/components/editor/EditorPane';
import RightSidebar, { SelectedElementData } from '@/components/editor/RightSidebar';
import dynamic from 'next/dynamic';
import { FeaturePanelType } from '@/components/editor/FeaturePanel';

const FeaturePanel = dynamic(
  () => import('@/components/editor/FeaturePanel').then((mod) => mod.FeaturePanel),
  { loading: () => null }
);
import EditorFooter from '@/components/editor/EditorFooter';
import LandingPage from '@/components/editor/LandingPage';
import { Repo } from '@/components/editor/GitHubRepoModal';
import { useRepository } from '@/hooks/useRepository';
import { DiagnosticsProvider } from '@/hooks/useDiagnostics';
import { AICommandsProvider } from '@/hooks/useAICommands';
import { ActivityLogProvider } from '@/hooks/useActivityLog';

// Terminal Panel Component (Placeholder - will be enhanced with AI features)
const TerminalPanel: React.FC<{ isCollapsed: boolean; onToggleCollapse: () => void }> = ({
  isCollapsed,
  onToggleCollapse,
}) => (
  <div className="flex flex-col h-full">
    <div className="flex items-center justify-between px-3 py-2 bg-surface-dark border-b border-border-dark">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-slate-400 text-[16px]">terminal</span>
        <span className="text-xs font-medium text-slate-300">Terminal</span>
      </div>
      <button
        onClick={onToggleCollapse}
        className="p-1 hover:bg-surface-hover rounded transition-colors"
      >
        <span className="material-symbols-outlined text-slate-400 text-[16px]">
          {isCollapsed ? 'expand_less' : 'expand_more'}
        </span>
      </button>
    </div>
    {!isCollapsed && (
      <div className="flex-1 flex items-center justify-center bg-[#1e1e1e] text-slate-500">
        <div className="text-center">
          <span className="material-symbols-outlined text-3xl mb-2 opacity-50">terminal</span>
          <p className="text-xs">Terminal output will appear here</p>
        </div>
      </div>
    )}
  </div>
);

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
  const [isTerminalCollapsed, setIsTerminalCollapsed] = useState(false);

  // Selected element state (kept for inspector compatibility, will be used by AI features)
  const [selectedElement, setSelectedElement] = useState<SelectedElementData | null>(null);

  // Feature Panel state
  const [activeFeaturePanel, setActiveFeaturePanel] = useState<FeaturePanelType>(null);

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

  // Resizing State
  const [terminalHeight, setTerminalHeight] = useState(192);
  const [isDraggingV, setIsDraggingV] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  // Handle Resize Events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingV) {
        const newHeight = window.innerHeight - e.clientY;
        setTerminalHeight(Math.max(36, Math.min(800, newHeight)));
        e.preventDefault();
      }
    };

    const handleMouseUp = () => {
      setIsDraggingV(false);
      document.body.style.cursor = 'default';
    };

    if (isDraggingV) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'row-resize';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
    };
  }, [isDraggingV]);

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
                onOpenFeaturePanel={setActiveFeaturePanel}
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
                  <div
                    className="h-1 hover:h-1.5 w-full bg-border-dark hover:bg-primary/50 cursor-row-resize z-50 transition-colors -mt-0.5 relative flex items-center justify-center group"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setIsDraggingV(true);
                    }}
                  >
                    {/* Visual handle indicator */}
                    <div className="w-12 h-1 rounded-full bg-slate-700 group-hover:bg-primary/80 hidden group-hover:block transition-all"></div>
                  </div>

                  {/* Bottom Half: Terminal */}
                  <div
                    className="bg-surface-dark border-t border-border-dark flex flex-col shrink-0 z-10"
                    style={{
                      height: isTerminalCollapsed ? '36px' : `${terminalHeight}px`,
                      transition: isDraggingV ? 'none' : 'height 0.2s ease',
                    }}
                  >
                    <TerminalPanel
                      isCollapsed={isTerminalCollapsed}
                      onToggleCollapse={() => setIsTerminalCollapsed(!isTerminalCollapsed)}
                    />
                  </div>
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

      {/* Feature Panel Modal */}
      <FeaturePanel activePanel={activeFeaturePanel} onClose={() => setActiveFeaturePanel(null)} />
    </>
  );
}
