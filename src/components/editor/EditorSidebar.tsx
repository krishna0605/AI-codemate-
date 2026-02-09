'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useRepository } from '@/hooks/useRepository';
import { FileTreeNode, getFileIcon } from '@/lib/github';
import { GitPanel } from './GitPanel';

interface EditorSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type SidebarTab = 'files' | 'git';

// Recursive file tree item component
const FileTreeItem: React.FC<{
  node: FileTreeNode;
  depth: number;
  onFileClick: (path: string) => void;
  selectedPath: string | null;
  dirtyPaths: Set<string>;
}> = ({ node, depth, onFileClick, selectedPath, dirtyPaths }) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2);

  const { icon, color } = getFileIcon(node.path);
  const isSelected = selectedPath === node.path;
  const isDirty = dirtyPaths.has(node.path);

  if (node.type === 'folder') {
    return (
      <div>
        <div
          className={cn(
            'flex items-center gap-1 py-1 px-2 text-sm text-slate-400 hover:text-white hover:bg-surface-hover rounded cursor-pointer',
            isExpanded && 'text-slate-300'
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span
            className={cn(
              'material-symbols-outlined text-[18px] transition-transform',
              isExpanded ? 'rotate-90' : 'rotate-0'
            )}
          >
            chevron_right
          </span>
          <span
            className={cn(
              'material-symbols-outlined text-[18px]',
              isExpanded ? 'text-blue-400' : 'text-purple-400'
            )}
          >
            {isExpanded ? 'folder_open' : 'folder'}
          </span>
          <span className="truncate">{node.name}</span>
        </div>

        {isExpanded && node.children && node.children.length > 0 && (
          <div className="border-l border-border-dark/50 ml-4">
            {node.children.map((child) => (
              <FileTreeItem
                key={child.path}
                node={child}
                depth={depth + 1}
                onFileClick={onFileClick}
                selectedPath={selectedPath}
                dirtyPaths={dirtyPaths}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // File item
  return (
    <div
      className={cn(
        'flex items-center gap-2 py-1 px-2 text-sm rounded cursor-pointer transition-colors',
        isSelected
          ? 'text-white bg-primary/10 border border-primary/20'
          : 'text-slate-400 hover:text-white hover:bg-surface-hover border border-transparent'
      )}
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
      onClick={() => onFileClick(node.path)}
    >
      <span className={cn('material-symbols-outlined text-[18px]', color)}>{icon}</span>
      <span className="truncate flex-1">{node.name}</span>
      {isDirty && (
        <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" title="Unsaved changes" />
      )}
    </div>
  );
};

const EditorSidebar: React.FC<EditorSidebarProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('files');

  const {
    fileTree,
    isLoadingTree,
    treeError,
    selectedFilePath,
    selectFile,
    repoName,
    getDirtyFiles,
  } = useRepository();

  const handleFileClick = (path: string) => {
    selectFile(path);
  };

  // Get set of dirty file paths for quick lookup
  const dirtyFiles = getDirtyFiles();
  const dirtyPaths = new Set(dirtyFiles.map((f) => f.path));
  const hasChanges = dirtyFiles.length > 0;

  return (
    <aside
      className={cn(
        'bg-surface-dark border-r border-border-dark flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden',
        isOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 border-none'
      )}
    >
      <div className="w-64 flex flex-col h-full min-w-[16rem]">
        {/* Tabs */}
        <div className="flex border-b border-border-dark relative">
          <button
            onClick={() => setActiveTab('files')}
            className={cn(
              'flex-1 py-3 text-xs font-medium transition-colors flex items-center justify-center gap-1.5',
              activeTab === 'files'
                ? 'text-white border-b-2 border-primary bg-background-dark/50'
                : 'text-slate-500 hover:text-slate-300 hover:bg-background-dark/30 border-b-2 border-transparent'
            )}
          >
            <span className="material-symbols-outlined text-[16px]">folder</span>
            Files
          </button>
          <button
            onClick={() => setActiveTab('git')}
            className={cn(
              'flex-1 py-3 text-xs font-medium transition-colors flex items-center justify-center gap-1.5',
              activeTab === 'git'
                ? 'text-white border-b-2 border-primary bg-background-dark/50'
                : 'text-slate-500 hover:text-slate-300 hover:bg-background-dark/30 border-b-2 border-transparent'
            )}
          >
            <span className="material-symbols-outlined text-[16px]">commit</span>
            Git
            {hasChanges && <span className="w-2 h-2 rounded-full bg-amber-400" />}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'files' ? (
          <>
            {/* File Tree Content */}
            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin select-none">
              {/* Loading State */}
              {isLoadingTree && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <span className="material-symbols-outlined animate-spin text-2xl mb-2">
                    progress_activity
                  </span>
                  <span className="text-xs">Loading files...</span>
                </div>
              )}

              {/* Error State */}
              {treeError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
                  {treeError}
                </div>
              )}

              {/* Empty State */}
              {!isLoadingTree && !treeError && fileTree.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <span className="material-symbols-outlined text-3xl mb-2">folder_off</span>
                  <span className="text-xs text-center">
                    No repository loaded.
                    <br />
                    Select a repo to view files.
                  </span>
                </div>
              )}

              {/* File Tree */}
              {!isLoadingTree && fileTree.length > 0 && (
                <div className="space-y-0.5">
                  {fileTree.map((node) => (
                    <FileTreeItem
                      key={node.path}
                      node={node}
                      depth={0}
                      onFileClick={handleFileClick}
                      selectedPath={selectedFilePath}
                      dirtyPaths={dirtyPaths}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Info */}
            <div className="p-4 border-t border-border-dark bg-background-dark/30">
              {repoName ? (
                <div className="text-[10px] text-slate-500 text-center">
                  <span className="material-symbols-outlined text-[14px] align-middle mr-1">
                    folder_open
                  </span>
                  {repoName}
                </div>
              ) : (
                <div className="border-2 border-dashed border-border-dark rounded-lg p-4 flex flex-col items-center justify-center text-center hover:border-primary/50 hover:bg-surface-hover transition-all cursor-pointer group">
                  <span className="material-symbols-outlined text-slate-500 group-hover:text-primary mb-2 transition-colors">
                    cloud_upload
                  </span>
                  <p className="text-[10px] text-slate-400 font-medium">Drop media assets here</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <GitPanel />
        )}
      </div>
    </aside>
  );
};

export default EditorSidebar;
