'use client';

import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { cn } from '@/lib/utils';
import { useAICommands } from '@/hooks/useAICommands';
import { QualityTab } from '@/components/quality';
import { useDiagnostics } from '@/hooks/useDiagnostics';

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

const RightSidebar: React.FC<RightSidebarProps> = ({
  selectedElement,
  onUpdateElement,
  onOpenInEditor,
}) => {
  const [width, setWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'inspector' | 'quality'>('ai');
  const [stylesExpanded, setStylesExpanded] = useState(false);
  const { errorCount, warningCount } = useDiagnostics();

  // AI Chat State
  const { lines, currentInput, setCurrentInput, executeCommand, isProcessing } = useAICommands();

  // Auto-scroll to bottom of chat
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const handleSend = () => {
    if (!currentInput.trim()) return;
    executeCommand(currentInput);
  };

  // ... (Inspector State) ...

  // ... (Resize Logic) ...

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

      {/* Tabs Header */}
      <div className="flex border-b border-border-dark bg-surface-dark z-10">
        <button
          onClick={() => setActiveTab('ai')}
          className={cn(
            'flex-1 py-3 text-xs font-medium transition-all flex items-center justify-center gap-2 relative',
            activeTab === 'ai'
              ? 'text-white bg-background-dark/30'
              : 'text-slate-500 hover:text-slate-300 hover:bg-surface-hover'
          )}
        >
          <span className="material-symbols-outlined text-[18px]">smart_toy</span>
          AI Assistant
          {activeTab === 'ai' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('inspector')}
          className={cn(
            'flex-1 py-3 text-xs font-medium transition-all flex items-center justify-center gap-2 relative',
            activeTab === 'inspector'
              ? 'text-white bg-background-dark/30'
              : 'text-slate-500 hover:text-slate-300 hover:bg-surface-hover'
          )}
        >
          <span className="material-symbols-outlined text-[18px]">data_object</span>
          Inspector
          {activeTab === 'inspector' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('quality')}
          className={cn(
            'flex-1 py-3 text-xs font-medium transition-all flex items-center justify-center gap-2 relative',
            activeTab === 'quality'
              ? 'text-white bg-background-dark/30'
              : 'text-slate-500 hover:text-slate-300 hover:bg-surface-hover'
          )}
        >
          <span className="material-symbols-outlined text-[18px]">bug_report</span>
          Quality
          {errorCount + warningCount > 0 && (
            <span className="bg-red-500 text-white text-[9px] px-1 rounded-full min-w-[14px] text-center">
              {errorCount + warningCount}
            </span>
          )}
          {activeTab === 'quality' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {/* --- AI Tab --- */}
        {activeTab === 'ai' && (
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
                    <p className="whitespace-pre-wrap">{msg.content}</p>
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
        {activeTab === 'inspector' && (
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
        {activeTab === 'quality' && (
          <div className="h-full animate-in fade-in duration-300">
            <QualityTab />
          </div>
        )}
      </div>
    </aside>
  );
};

export default RightSidebar;
