'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { useRepository } from '@/hooks/useRepository';
import { useGit } from '@/hooks/useGit';
import { useDiagnostics, monacoSeverityToDiagnostic, Diagnostic } from '@/hooks/useDiagnostics';
import { validateCode } from '@/utils/validators';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase';
import { createPresenceChannel, updateCursor } from '@/lib/collaboration/presence';
import { createYjsProvider } from '@/lib/collaboration/supabase-yjs-provider';
import { CollaboratorCursors } from './CollaboratorCursors';

import { CommentThread, Comment, generateId } from '@/lib/collaboration/comments';
import { CommentThreadView } from './CommentThread';
import { ReviewPanel } from './ReviewPanel';

// Inject static CSS for Monaco decorations
const EDITOR_STYLES = `
.neon-editor-highlight {
  background-color: rgba(57, 255, 20, 0.1) !important;
  box-shadow: inset 4px 0 0 0 #39ff14 !important;
}
.neon-editor-gutter {
  background-color: #39ff14 !important;
  width: 6px !important;
  box-shadow: 0 0 10px #39ff14 !important;
  border-radius: 2px !important;
  margin-left: 6px;
}
.comment-glyph {
    background: #FFD700;
    width: 5px !important;
    margin-left: 5px;
    border-radius: 50%;
}
`;

interface EditorPaneProps {
  highlightSection?: { start: number; end: number } | null;
}

const PLACEHOLDER_CODE = `// Select a file from the sidebar to start editing

// Welcome to AI CodeMate! 
// Your repositories are ready to be explored.

// Quick tips:
// 1. Click on a file in the sidebar to view its contents
// 2. Use the file tabs above to switch between open files
// 3. Changes are tracked but not automatically saved

export default function Welcome() {
  return (
    <div className="welcome">
      <h1>Ready to code!</h1>
      <p>Select a file to get started.</p>
    </div>
  );
}
`;

const EditorPane: React.FC<EditorPaneProps> = ({ highlightSection }) => {
  const [mounted, setMounted] = useState(false);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<any[]>([]);

  const {
    currentFile,
    isLoadingFile,
    fileError,
    openFiles,
    selectedFilePath,
    selectFile,
    closeFile,
    updateFileContent,
  } = useRepository();

  // Diagnostics context for error/warning tracking
  const { setFileDiagnostics } = useDiagnostics();

  // Git operations for saving
  // Presence state
  const { user } = useAuth();
  const [channel, setChannel] = useState<any>(null);
  const supabase = createClient();

  // Y.js state
  const [provider, setProvider] = useState<any>(null);
  const [binding, setBinding] = useState<any>(null);

  const { saveFile, isSaving } = useGit();

  // Comments State
  const [threads, setThreads] = useState<CommentThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [showReviewPanel, setShowReviewPanel] = useState(false);
  const [commentWidgetPosition, setCommentWidgetPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  // Y.js Comments Array
  const commentsArrayRef = useRef<any>(null);

  // Helper: Add Comment
  const addComment = (threadId: string, content: string) => {
    if (!commentsArrayRef.current || !user) return;

    const threadIndex = threads.findIndex((t) => t.id === threadId);
    if (threadIndex === -1) return;

    const thread = threads[threadIndex];
    const newComment: Comment = {
      id: generateId(),
      authorId: user.id,
      authorName: user.name || user.email.split('@')[0],
      authorEmail: user.email,
      content,
      timestamp: Date.now(),
    };

    const updatedThread = { ...thread, comments: [...thread.comments, newComment] };

    // Update Y.js
    commentsArrayRef.current.delete(threadIndex, 1);
    commentsArrayRef.current.insert(threadIndex, [updatedThread]);
  };

  // Helper: Create Thread
  const createThread = (lineNumber: number) => {
    if (!commentsArrayRef.current || !user || !currentFile) return;

    const newThread: CommentThread = {
      id: generateId(),
      filePath: currentFile.path,
      lineNumber,
      status: 'open',
      comments: [],
      createdAt: Date.now(),
    };

    commentsArrayRef.current.push([newThread]);
    setActiveThreadId(newThread.id);
  };

  // Helper: Resolve/Delete logic (simplified for now)
  const resolveThread = (threadId: string) => {
    if (!commentsArrayRef.current) return;
    const index = threads.findIndex((t) => t.id === threadId);
    if (index === -1) return;

    const thread = threads[index];
    const updated = { ...thread, status: 'resolved' as const };
    commentsArrayRef.current.delete(index, 1);
    commentsArrayRef.current.insert(index, [updated]);
  };

  const deleteThread = (threadId: string) => {
    if (!commentsArrayRef.current) return;
    const index = threads.findIndex((t) => t.id === threadId);
    if (index !== -1) {
      commentsArrayRef.current.delete(index, 1);
      if (activeThreadId === threadId) setActiveThreadId(null);
    }
  };

  useEffect(() => {
    setMounted(true);
    // Inject styles
    const styleId = 'monaco-custom-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = EDITOR_STYLES;
      document.head.appendChild(style);
    }
  }, []);

  // Ctrl+S keyboard shortcut to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (currentFile?.isDirty && !isSaving) {
          saveFile(currentFile.path);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentFile, saveFile, isSaving]);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined && currentFile) {
      updateFileContent(currentFile.path, value);

      // Run custom validators for non-Monaco languages
      const customDiags = validateCode(value, currentFile.language);
      if (customDiags.length > 0) {
        setFileDiagnostics(currentFile.path, customDiags);
      }
    }
  };

  // Handle Monaco's built-in validation (TS/JS/JSON/CSS/HTML)
  const handleEditorValidation = useCallback(
    (markers: any[]) => {
      if (!currentFile) return;

      const diagnostics: Diagnostic[] = markers.map((marker) => ({
        message: marker.message,
        severity: monacoSeverityToDiagnostic(marker.severity),
        startLine: marker.startLineNumber,
        endLine: marker.endLineNumber,
        startColumn: marker.startColumn,
        endColumn: marker.endColumn,
        source: currentFile.language,
      }));

      setFileDiagnostics(currentFile.path, diagnostics);
    },
    [currentFile, setFileDiagnostics]
  );

  // Handle highlighting when prop changes
  useEffect(() => {
    if (mounted && highlightSection && editorRef.current && monacoRef.current) {
      const editor = editorRef.current;
      const monaco = monacoRef.current;

      // Reveal the section in the center of the viewport
      editor.revealLineInCenter(highlightSection.start);
      editor.setPosition({ lineNumber: highlightSection.start, column: 1 });
      editor.focus();

      // Apply decoration to highlight the range of lines
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, [
        {
          range: new monaco.Range(highlightSection.start, 1, highlightSection.end, 1),
          options: {
            isWholeLine: true,
            className: 'neon-editor-highlight',
            linesDecorationsClassName: 'neon-editor-gutter',
            stickiness: monaco.editor.TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges,
          },
        },
      ]);
    } else if (
      mounted &&
      !highlightSection &&
      editorRef.current &&
      decorationsRef.current.length > 0
    ) {
      // Clear decorations if highlightSection is null
      editorRef.current.deltaDecorations(decorationsRef.current, []);
    }
  }, [highlightSection, mounted]);

  // Presence & Y.js Sync
  useEffect(() => {
    if (!currentFile?.path || !user || !editorRef.current || !monacoRef.current) {
      return;
    }

    // 1. Setup Presence (Cursors)
    const docId = btoa(`${currentFile.path}`).replace(/[^a-zA-Z0-9]/g, '');
    const newChannel = createPresenceChannel(supabase, docId, user.id, {
      email: user.email,
      name: user.name || undefined,
    });
    setChannel(newChannel);

    let providerInstance: any = null;
    let bindingInstance: any = null;

    // 2. Setup Y.js (Content Sync)
    import('yjs').then((Y) => {
      import('y-monaco').then(({ MonacoBinding }) => {
        // Check if component unmounted or file changed while loading
        if (newChannel.state === 'closed') return;

        const doc = new Y.Doc();
        const type = doc.getText('monaco');

        // Initialize with current content if doc is new
        if (currentFile.content) {
          doc.getText('monaco').insert(0, currentFile.content);
        }

        providerInstance = createYjsProvider(supabase, doc, docId);
        setProvider(providerInstance);

        bindingInstance = new MonacoBinding(
          type,
          editorRef.current.getModel(),
          new Set([editorRef.current]),
          providerInstance.awareness
        );
        setBinding(bindingInstance);

        // 2b. Setup Comments
        const commentsArray = doc.getArray<CommentThread>('comments');
        commentsArrayRef.current = commentsArray;

        // Initial sync
        setThreads(commentsArray.toArray());

        // Listen for changes
        commentsArray.observe(() => {
          setThreads(commentsArray.toArray());
        });

        // Update user info in awareness
        providerInstance.awareness.setLocalStateField('user', {
          name: user.name || user.email,
          color: '#' + Math.floor(Math.random() * 16777215).toString(16), // Random color
        });
      });
    });

    return () => {
      newChannel.unsubscribe();
      setChannel(null);

      if (providerInstance) {
        providerInstance.destroy();
        setProvider(null);
      }
      if (bindingInstance) {
        bindingInstance.destroy();
        setBinding(null);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFile?.path, user, supabase]); // Re-run when file changes. editorRef/monacoRef are refs.

  // Broadcast cursor movements (for presence channel)
  useEffect(() => {
    if (!editorRef.current || !channel) return;

    const disposable = editorRef.current.onDidChangeCursorPosition((e: any) => {
      updateCursor(channel, {
        line: e.position.lineNumber,
        column: e.position.column,
      });
    });

    return () => {
      disposable.dispose();
    };
  }, [channel]);

  // Handle Comment Decorations and Context Menu
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current || !currentFile) return;
    const editor = editorRef.current;
    const monaco = monacoRef.current;

    // 1. Context Menu Action
    const action = editor.addAction({
      id: 'add-comment',
      label: 'Add Comment',
      contextMenuGroupId: 'navigation',
      run: (ed: any) => {
        const position = ed.getPosition();
        if (position) {
          createThread(position.lineNumber);
        }
      },
    });

    // 2. Decorations (Glyphs)
    const decorations = threads
      .filter((t) => t.filePath === currentFile.path && t.status === 'open')
      .map((t) => ({
        range: new monaco.Range(t.lineNumber, 1, t.lineNumber, 1),
        options: {
          isWholeLine: false,
          glyphMarginClassName: 'comment-glyph',
          glyphMarginHoverMessage: { value: 'Has comments' },
        },
      }));

    const oldDecorations =
      editor
        .getModel()
        ?.getAllDecorations()
        .filter((d: any) => d.options.glyphMarginClassName === 'comment-glyph')
        .map((d: any) => d.id) || [];

    editor.deltaDecorations(oldDecorations, decorations);

    // 3. Update Widget Position
    if (activeThreadId) {
      const thread = threads.find((t) => t.id === activeThreadId);
      if (thread && thread.filePath === currentFile.path) {
        const top = editor.getTopForLineNumber(thread.lineNumber);
        const height = editor.getOption(monaco.editor.EditorOption.lineHeight);
        // Simple positioning (can be improved)
        setCommentWidgetPosition({ top: top + height, left: 50 });
      }
    } else {
      setCommentWidgetPosition(null);
    }

    return () => {
      action.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorRef.current, currentFile, threads, activeThreadId]);

  if (!mounted) return <div className="bg-[#1e1e1e] flex-1"></div>;

  // Get file name from path
  const getFileName = (path: string) => path.split('/').pop() || path;

  return (
    <div className="h-full w-full overflow-hidden relative flex flex-col">
      {/* File Tabs */}
      {openFiles.length > 0 && (
        <div className="flex bg-[#252526] border-b border-[#1e1e1e] overflow-x-auto scrollbar-thin">
          {openFiles.map((file) => (
            <div
              key={file.path}
              className={`flex items-center gap-2 px-3 py-2 text-xs border-r border-[#1e1e1e] cursor-pointer group min-w-fit ${
                selectedFilePath === file.path
                  ? 'bg-[#1e1e1e] text-white'
                  : 'text-slate-400 hover:bg-[#2d2d2d]'
              }`}
              onClick={() => selectFile(file.path)}
            >
              <span className={`${file.isDirty ? 'text-yellow-400' : ''}`}>
                {getFileName(file.path)}
              </span>
              {file.isDirty && <span className="w-2 h-2 rounded-full bg-yellow-400"></span>}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeFile(file.path);
                }}
                className="ml-1 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded p-0.5 transition-opacity"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Editor Content & Review Panel */}
      <div className="flex-1 relative flex overflow-hidden">
        <div className="flex-1 relative">
          <CollaboratorCursors
            editor={editorRef.current}
            channel={channel}
            currentUserId={user?.id || ''}
          />

          {/* ... (Loading/Error/Overlay states from previous step) ... */}
          {/* Note: I am not repeating the Overlay code here in replacement, assuming it's already there from previous step. 
                I need to be careful not to delete it.
                Actually, the previous step inserted the Overlay BEFORE the Editor component.
                So I just need to wrap everything here. */}

          {isLoadingFile && (
            <div className="absolute inset-0 bg-[#1e1e1e] flex items-center justify-center z-10">
              <div className="flex items-center gap-2 text-slate-400">
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                <span className="text-sm">Loading file...</span>
              </div>
            </div>
          )}

          {/* Error state */}
          {fileError && (
            <div className="absolute inset-0 bg-[#1e1e1e] flex items-center justify-center z-10">
              <div className="text-center">
                <span className="material-symbols-outlined text-red-400 text-4xl mb-2">error</span>
                <p className="text-red-400 text-sm">{fileError}</p>
              </div>
            </div>
          )}

          {/* Comment Overlay Widget */}
          {activeThreadId && commentWidgetPosition && (
            <div
              className="absolute z-50 text-left"
              style={{ top: commentWidgetPosition.top, left: commentWidgetPosition.left }}
            >
              {(() => {
                const thread = threads.find((t) => t.id === activeThreadId);
                if (thread) {
                  return (
                    <CommentThreadView
                      thread={thread}
                      currentUser={{
                        id: user?.id || 'anon',
                        name: user?.name || 'Anonymous',
                        email: user?.email || 'anon@example.com',
                      }}
                      onAddComment={(content) => addComment(thread.id, content)}
                      onResolve={() => resolveThread(thread.id)}
                      onClose={() => setActiveThreadId(null)}
                    />
                  );
                }
                return null;
              })()}
            </div>
          )}

          <Editor
            height="100%"
            language={currentFile?.language || 'javascript'}
            value={currentFile?.content || PLACEHOLDER_CODE}
            theme="vs-dark"
            onMount={handleEditorDidMount}
            onChange={handleEditorChange}
            onValidate={handleEditorValidation}
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              fontFamily: "'JetBrains Mono', monospace",
              lineHeight: 24,
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              formatOnPaste: true,
              formatOnType: true,
              folding: true,
              foldingStrategy: 'indentation',
              showFoldingControls: 'always',
              bracketPairColorization: { enabled: true },
              autoClosingBrackets: 'always',
              readOnly: !currentFile,
              suggest: {
                showKeywords: true,
                showSnippets: true,
              },
              glyphMargin: true, // Enable glyph margin for comments
            }}
            loading={
              <div className="flex items-center justify-center h-full text-slate-500 gap-2 bg-[#1e1e1e]">
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                <span className="text-xs font-mono">Initializing Editor...</span>
              </div>
            }
          />
        </div>

        {/* Review Panel Sidebar */}
        {showReviewPanel && (
          <ReviewPanel
            threads={threads.filter((t) => t.filePath === currentFile?.path)}
            onSelectThread={(id) => {
              setActiveThreadId(id);
              // Scroll to line
              const thread = threads.find((t) => t.id === id);
              if (thread && editorRef.current) {
                editorRef.current.revealLineInCenter(thread.lineNumber);
              }
            }}
            onDeleteThread={deleteThread}
            currentUserId={user?.id || ''}
          />
        )}
      </div>

      {/* Review Panel Toggle (Floating) */}
      <button
        onClick={() => setShowReviewPanel(!showReviewPanel)}
        className={`absolute bottom-4 right-8 z-50 p-2 rounded-full shadow-lg transition-colors ${
          showReviewPanel
            ? 'bg-blue-600 text-white'
            : 'bg-[#3e3e42] text-gray-300 hover:bg-[#4e4e52]'
        }`}
        title="Toggle Review Panel"
      >
        <span className="material-symbols-outlined">comment</span>
      </button>
    </div>
  );
};

export default EditorPane;
