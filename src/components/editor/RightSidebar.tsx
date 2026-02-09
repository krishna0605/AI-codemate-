'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Editor from '@monaco-editor/react';
import { cn } from '@/lib/utils';
import { useAICommands } from '@/hooks/useAICommands';
import { QualityTab } from '@/components/quality';
import { useDiagnostics } from '@/hooks/useDiagnostics';

// Learning Components
import { TutorialPlayer, TipOfTheDay, ChallengeMode } from '@/components/learning';

// Productivity Components
import { SnippetLibrary, TemplateGallery, ShortcutsPanel } from '@/components/productivity';

// Integration Components
import { APITester, DatabaseExplorer, DeploymentPanel } from '@/components/integrations';

// UI Components
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';

// Type definition (was previously in PreviewPane.tsx)
export interface SelectedElementData {
  tagName: string;
  className: string;
  styles: Record<string, string>;
  snippet: string;
}

interface RightSidebarProps {
  selectedElement: SelectedElementData | null;
  onUpdateElement: (element: SelectedElementData) => void;
  onOpenInEditor: () => void;
}

type SidebarMode = 'ai' | 'inspector' | 'quality' | 'learn' | 'snippets' | 'integrations';
type LearnTab = 'tutorials' | 'tips' | 'challenges';
type IntegrationTab = 'api' | 'database' | 'deploy';
type SnippetTab = 'snippets' | 'templates' | 'shortcuts';

const RightSidebar: React.FC<RightSidebarProps> = ({
  selectedElement,
  onUpdateElement,
  onOpenInEditor,
}) => {
  const [width, setWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);
  const [activeMode, setActiveMode] = useState<SidebarMode>('ai');
  const [stylesExpanded, setStylesExpanded] = useState(false);
  const { errorCount, warningCount } = useDiagnostics();

  // Sub-tabs state
  const [learnTab, setLearnTab] = useState<LearnTab>('tutorials');
  const [integrationTab, setIntegrationTab] = useState<IntegrationTab>('api');
  const [snippetTab, setSnippetTab] = useState<SnippetTab>('snippets');

  // AI Chat State
  const { lines, currentInput, setCurrentInput, executeCommand, isProcessing } = useAICommands();

  // Auto-scroll to bottom of chat
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines, activeMode]);

  const handleSend = () => {
    if (!currentInput.trim()) return;
    executeCommand(currentInput);
  };

  // Resize Logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = window.innerWidth - e.clientX;
        setWidth(Math.max(250, Math.min(800, newWidth)));
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
    };
  }, [isResizing]);

  const handleStyleChange = (key: string, value: string) => {
    if (!selectedElement) return;
    const newStyles = { ...selectedElement.styles, [key]: value };
    onUpdateElement({ ...selectedElement, styles: newStyles });
  };

  const handleSnippetChange = (value: string | undefined) => {
    if (!selectedElement || value === undefined) return;
    onUpdateElement({ ...selectedElement, snippet: value });
  };

  const styleEntries = selectedElement ? Object.entries(selectedElement.styles) : [];

  return (
    <aside
      style={{ width }}
      className="bg-surface-dark border-l border-border-dark flex flex-col flex-shrink-0 hidden xl:flex relative transition-none"
    >
      {/* Resize Handle */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-primary/50 z-50 transition-colors bg-transparent hover:bg-primary/20"
        onMouseDown={() => setIsResizing(true)}
      />

      <div className="p-3 border-b border-border-dark bg-surface-dark z-10">
        <Select value={activeMode} onValueChange={(v) => setActiveMode(v as SidebarMode)}>
          <SelectTrigger className="w-full bg-background-dark border-border-dark text-slate-300">
            {activeMode === 'ai' && (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                AI Assistant
              </div>
            )}
            {activeMode === 'inspector' && (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">data_object</span>
                Inspector
              </div>
            )}
            {activeMode === 'quality' && (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">bug_report</span>
                Quality
                {errorCount + warningCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 rounded-full">
                    {errorCount + warningCount}
                  </span>
                )}
              </div>
            )}
            {activeMode === 'learn' && (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">school</span>
                Learn & Discover
              </div>
            )}
            {activeMode === 'snippets' && (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">data_object</span>
                Code Tools
              </div>
            )}
            {activeMode === 'integrations' && (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">extension</span>
                Integrations
              </div>
            )}
          </SelectTrigger>
          <SelectContent className="bg-surface-dark border-border-dark text-slate-300">
            <SelectItem value="ai">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                AI Assistant
              </div>
            </SelectItem>
            <SelectItem value="inspector">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">data_object</span>
                Inspector
              </div>
            </SelectItem>
            <SelectItem value="quality">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">bug_report</span>
                Quality
                {errorCount + warningCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 rounded-full">
                    {errorCount + warningCount}
                  </span>
                )}
              </div>
            </SelectItem>
            <SelectItem value="learn">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">school</span>
                Learn & Discover
              </div>
            </SelectItem>
            <SelectItem value="snippets">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">data_object</span>
                Code Tools
              </div>
            </SelectItem>
            <SelectItem value="integrations">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">extension</span>
                Integrations
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {/* --- AI Tab --- */}
        {activeMode === 'ai' && (
          <div className="flex flex-col h-full animate-in fade-in duration-300">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-background-dark/20">
              {lines.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`size-6 rounded-full flex items-center justify-center flex-shrink-0 ${msg.type === 'assistant' ? 'bg-primary/20 text-primary' : msg.type === 'error' ? 'bg-red-500/20 text-red-500' : 'bg-slate-700'}`}
                  >
                    {msg.type === 'assistant' ? (
                      <span className="material-symbols-outlined text-[14px]">smart_toy</span>
                    ) : msg.type === 'error' ? (
                      <span className="material-symbols-outlined text-[14px]">error</span>
                    ) : msg.type === 'system' ? (
                      <span className="material-symbols-outlined text-[14px]">info</span>
                    ) : (
                      <span className="text-[10px] font-bold">ME</span>
                    )}
                  </div>
                  <div
                    className={`rounded-lg p-3 text-xs leading-relaxed max-w-[85%] ${
                      msg.type === 'assistant'
                        ? 'bg-surface-hover border border-border-dark text-slate-300'
                        : msg.type === 'error'
                          ? 'bg-red-500/10 border border-red-500/20 text-red-300'
                          : msg.type === 'system'
                            ? 'bg-blue-500/10 border border-blue-500/20 text-blue-300'
                            : 'bg-primary/10 border border-primary/20 text-white'
                    }`}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                        ul: ({ node, ...props }) => (
                          <ul className="list-disc list-inside mb-2" {...props} />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol className="list-decimal list-inside mb-2" {...props} />
                        ),
                        li: ({ node, ...props }) => <li className="mb-0.5" {...props} />,
                        h1: ({ node, ...props }) => (
                          <h1 className="text-sm font-bold mb-2 mt-4" {...props} />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2 className="text-xs font-bold mb-2 mt-3" {...props} />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3 className="text-xs font-semibold mb-1 mt-2" {...props} />
                        ),
                        code: ({ node, inline, className, children, ...props }: any) => {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline ? (
                            <div className="my-2 rounded-md overflow-hidden border border-border-dark bg-[#1e1e1e]">
                              <div className="flex items-center justify-between px-3 py-1.5 bg-white/5 border-b border-border-dark">
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {match ? match[1] : 'code'}
                                </span>
                              </div>
                              <div className="p-3 overflow-x-auto">
                                <code
                                  className={cn('font-mono text-[11px] leading-relaxed', className)}
                                  {...props}
                                >
                                  {children}
                                </code>
                              </div>
                            </div>
                          ) : (
                            <code
                              className="font-mono text-[11px] bg-slate-800/50 px-1 py-0.5 rounded border border-slate-700/50 text-orange-300"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex gap-3">
                  <div className="size-6 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[14px] animate-pulse">
                      smart_toy
                    </span>
                  </div>
                  <div className="bg-surface-hover border border-border-dark text-slate-400 rounded-lg p-3 text-xs flex items-center gap-2">
                    <span className="size-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="size-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="size-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-3 border-t border-border-dark bg-surface-dark">
              <div className="relative">
                <input
                  className="w-full bg-background-dark border border-border-dark rounded-md py-2 pl-3 pr-8 text-xs text-white placeholder:text-slate-600 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                  placeholder="Ask AI CodeMate..."
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isProcessing && handleSend()}
                  disabled={isProcessing}
                />
                <button
                  className="absolute right-2 top-1.5 text-slate-500 hover:text-primary transition-colors disabled:opacity-50"
                  onClick={handleSend}
                  disabled={isProcessing || !currentInput.trim()}
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- Inspector Tab --- */}
        {activeMode === 'inspector' && (
          <div className="flex flex-col h-full animate-in fade-in duration-300">
            {selectedElement ? (
              <>
                <div className="p-3 border-b border-border-dark bg-background-dark/10 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="size-6 bg-blue-500/10 rounded flex items-center justify-center text-blue-400">
                      <span className="material-symbols-outlined text-[14px]">code_blocks</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{selectedElement.tagName}</div>
                      <div className="text-[10px] text-slate-500 font-mono truncate max-w-[200px]">
                        {selectedElement.className.split(' ')[0]}...
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onOpenInEditor}
                      className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md transition-all flex items-center gap-1.5 group"
                      title="Open Component in Editor"
                    >
                      <span className="material-symbols-outlined text-[16px] group-hover:scale-110 transition-transform">
                        arrow_outward
                      </span>
                    </button>
                    <div className="text-[10px] text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded font-medium">
                      Active
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-thin">
                  {/* Edit Styles Section */}
                  <div className="p-4 border-b border-border-dark/50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">palette</span>{' '}
                        Styles
                      </h4>
                      <button
                        onClick={() => setStylesExpanded(!stylesExpanded)}
                        className="text-[10px] text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                      >
                        {stylesExpanded ? 'Less' : 'More'}
                      </button>
                    </div>
                    <div className="bg-black/20 rounded-lg border border-border-dark overflow-hidden">
                      {(stylesExpanded ? styleEntries : styleEntries.slice(0, 5)).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center border-b border-border-dark/50 last:border-0 hover:bg-white/5 transition-colors group"
                          >
                            <div className="w-1/3 px-2 py-1.5 border-r border-border-dark/50">
                              <span
                                className="text-[10px] text-slate-400 font-mono truncate block"
                                title={key}
                              >
                                {key}
                              </span>
                            </div>
                            <div className="flex-1 px-2 py-1">
                              <input
                                type="text"
                                value={value}
                                onChange={(e) => handleStyleChange(key, e.target.value)}
                                className="w-full bg-transparent border-none p-0 text-[10px] text-slate-200 font-mono focus:ring-0 placeholder:text-slate-700"
                              />
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Component Code Editor */}
                  <div className="flex flex-col h-[400px]">
                    <div className="px-4 py-2 flex items-center justify-between">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">code</span>{' '}
                        Component Code
                      </h4>
                      <span className="text-[10px] text-slate-600">ReadOnly Mock</span>
                    </div>
                    <div className="flex-1 border-y border-border-dark bg-[#1e1e1e]">
                      <Editor
                        height="100%"
                        defaultLanguage="typescript"
                        language="typescript"
                        value={selectedElement.snippet}
                        onChange={handleSnippetChange}
                        theme="vs-dark"
                        options={{
                          minimap: { enabled: false },
                          fontSize: 12,
                          lineHeight: 20,
                          fontFamily: "'JetBrains Mono', monospace",
                          scrollBeyondLastLine: false,
                          folding: false,
                          lineNumbers: 'off',
                          glyphMargin: false,
                          padding: { top: 8, bottom: 8 },
                        }}
                      />
                    </div>
                    <div className="p-2 bg-surface-hover/50 text-[10px] text-slate-500 text-center">
                      Changes here update the snippet state
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 p-8 h-full animate-in fade-in zoom-in duration-300">
                <div className="size-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 ring-1 ring-slate-700">
                  <span className="material-symbols-outlined text-[32px] opacity-40">
                    data_object
                  </span>
                </div>
                <p className="text-sm font-medium mb-1 text-slate-300">No Component Selected</p>
                <p className="text-xs opacity-50 max-w-[220px] leading-relaxed">
                  Select code in the editor to inspect its structure and get AI-powered suggestions.
                </p>
              </div>
            )}
          </div>
        )}

        {/* --- Quality Tab --- */}
        {activeMode === 'quality' && (
          <div className="h-full animate-in fade-in duration-300">
            <QualityTab />
          </div>
        )}

        {/* --- Learn Tab --- */}
        {activeMode === 'learn' && (
          <div className="flex flex-col h-full animate-in fade-in duration-300">
            <div className="flex border-b border-border-dark bg-background-dark/20">
              {(['tutorials', 'tips', 'challenges'] as LearnTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setLearnTab(tab)}
                  className={cn(
                    'flex-1 py-2 text-[10px] font-medium transition-colors uppercase tracking-wider',
                    learnTab === tab
                      ? 'text-white border-b-2 border-primary bg-primary/10'
                      : 'text-slate-500 hover:text-slate-300'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-hidden">
              {learnTab === 'tutorials' && <TutorialPlayer />}
              {learnTab === 'tips' && <TipOfTheDay />}
              {learnTab === 'challenges' && <ChallengeMode />}
            </div>
          </div>
        )}

        {/* --- Snippets Tab --- */}
        {activeMode === 'snippets' && (
          <div className="flex flex-col h-full animate-in fade-in duration-300">
            <div className="flex border-b border-border-dark bg-background-dark/20">
              {(['snippets', 'templates', 'shortcuts'] as SnippetTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSnippetTab(tab)}
                  className={cn(
                    'flex-1 py-2 text-[10px] font-medium transition-colors uppercase tracking-wider',
                    snippetTab === tab
                      ? 'text-white border-b-2 border-primary bg-primary/10'
                      : 'text-slate-500 hover:text-slate-300'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-hidden">
              {snippetTab === 'snippets' && (
                <SnippetLibrary onInsertSnippet={(code) => console.log('Insert:', code)} />
              )}
              {snippetTab === 'templates' && <TemplateGallery />}
              {snippetTab === 'shortcuts' && <ShortcutsPanel />}
            </div>
          </div>
        )}

        {/* --- Integrations Tab --- */}
        {activeMode === 'integrations' && (
          <div className="flex flex-col h-full animate-in fade-in duration-300">
            <div className="flex border-b border-border-dark bg-background-dark/20">
              {(['api', 'database', 'deploy'] as IntegrationTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setIntegrationTab(tab)}
                  className={cn(
                    'flex-1 py-2 text-[10px] font-medium transition-colors uppercase tracking-wider',
                    integrationTab === tab
                      ? 'text-white border-b-2 border-primary bg-primary/10'
                      : 'text-slate-500 hover:text-slate-300'
                  )}
                >
                  {tab === 'api' ? 'API' : tab === 'database' ? 'DB' : 'Deploy'}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-hidden">
              {integrationTab === 'api' && <APITester />}
              {integrationTab === 'database' && <DatabaseExplorer />}
              {integrationTab === 'deploy' && <DeploymentPanel />}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default RightSidebar;
