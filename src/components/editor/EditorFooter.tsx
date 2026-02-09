'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useRepository } from '@/hooks/useRepository';
import { useDiagnostics } from '@/hooks/useDiagnostics';

// Map file extensions to language names
const getLanguageFromPath = (filePath: string | null): string => {
  if (!filePath) return 'Plain Text';
  const ext = filePath.split('.').pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    ts: 'TypeScript',
    tsx: 'TypeScript JSX',
    js: 'JavaScript',
    jsx: 'JavaScript JSX',
    json: 'JSON',
    md: 'Markdown',
    css: 'CSS',
    scss: 'SCSS',
    html: 'HTML',
    py: 'Python',
    java: 'Java',
    go: 'Go',
    rs: 'Rust',
    cpp: 'C++',
    c: 'C',
    yml: 'YAML',
    yaml: 'YAML',
    sql: 'SQL',
    sh: 'Shell',
    bash: 'Bash',
  };
  return languageMap[ext || ''] || 'Plain Text';
};

const EditorFooter: React.FC = () => {
  const { defaultBranch, openFiles, selectedFilePath } = useRepository();
  const { errorCount, warningCount } = useDiagnostics();

  // Check if any file has unsaved changes
  const hasDirtyFiles = openFiles.some((file) => file.isDirty);

  // Get branch display with dirty indicator
  const branchDisplay = `${defaultBranch || 'main'}${hasDirtyFiles ? '*' : ''}`;

  // Get current file language
  const currentLanguage = getLanguageFromPath(selectedFilePath);

  return (
    <footer className="h-7 bg-surface-dark border-t border-border-dark flex items-center px-3 justify-between text-[10px] text-slate-500 shrink-0 select-none z-30">
      <div className="flex items-center gap-3">
        <a href="#" className="flex items-center gap-1.5 hover:text-white transition-colors">
          <span className="material-symbols-outlined text-[14px] text-primary">
            source_environment
          </span>
          <span className="font-semibold">{branchDisplay}</span>
        </a>

        <div className="h-3 w-px bg-border-dark"></div>

        <div className="flex items-center gap-1 hover:text-slate-300 cursor-pointer transition-colors">
          <span
            className={`material-symbols-outlined text-[14px] ${errorCount > 0 ? 'text-red-400' : ''}`}
          >
            error
          </span>
          <span className={errorCount > 0 ? 'text-red-400 font-semibold' : ''}>{errorCount}</span>
          <span
            className={`material-symbols-outlined text-[14px] ml-1 ${warningCount > 0 ? 'text-yellow-400' : ''}`}
          >
            warning
          </span>
          <span className={warningCount > 0 ? 'text-yellow-400 font-semibold' : ''}>
            {warningCount}
          </span>
        </div>

        <div className="h-3 w-px bg-border-dark"></div>

        <div className="flex items-center gap-1.5 animate-pulse">
          <div className="size-1.5 rounded-full bg-primary"></div>
          <span className="text-primary">AI Ready</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 hover:text-slate-300 cursor-pointer transition-colors">
          <span className="material-symbols-outlined text-[14px]">code</span>
          <span>UTF-8</span>
        </div>
        <div className="flex items-center gap-1 hover:text-slate-300 cursor-pointer transition-colors">
          <span className="material-symbols-outlined text-[14px]">data_object</span>
          <span>{currentLanguage}</span>
        </div>
        <div className="flex items-center gap-1 hover:text-slate-300 cursor-pointer transition-colors">
          <span className="material-symbols-outlined text-[14px]">notifications</span>
          <Badge variant="secondary" className="px-1 h-4 min-w-[16px] justify-center">
            3
          </Badge>
        </div>
        <div className="flex items-center gap-1 hover:text-primary cursor-pointer transition-colors">
          <span className="material-symbols-outlined text-[14px]">wifi</span>
          <span>Online</span>
        </div>
      </div>
    </footer>
  );
};

export default EditorFooter;
