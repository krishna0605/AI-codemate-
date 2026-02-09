'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { FileChange } from '@/types/gitTypes';

interface CommitModalProps {
  isOpen: boolean;
  onClose: () => void;
  changedFiles: FileChange[];
  onCommit: (message: string) => Promise<void>;
  isCommitting: boolean;
}

export function CommitModal({
  isOpen,
  onClose,
  changedFiles,
  onCommit,
  isCommitting,
}: CommitModalProps) {
  const [message, setMessage] = useState('');
  const [description, setDescription] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setMessage('');
      setDescription('');
    }
  }, [isOpen]);

  const handleSubmit = useCallback(async () => {
    if (!message.trim() || isCommitting) return;

    const fullMessage = description.trim()
      ? `${message.trim()}\n\n${description.trim()}`
      : message.trim();

    await onCommit(fullMessage);
  }, [message, description, isCommitting, onCommit]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && message.trim()) {
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, message, onClose, handleSubmit]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-surface-dark border border-border-dark rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border-dark flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">commit</span>
              <h2 className="text-sm font-semibold text-white">Commit Changes</h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Changed Files */}
          <div className="px-4 py-3 border-b border-border-dark bg-black/20">
            <p className="text-xs text-slate-400 mb-2">
              {changedFiles.length} file{changedFiles.length !== 1 ? 's' : ''} to commit
            </p>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {changedFiles.map((file) => (
                <div key={file.path} className="flex items-center gap-2 py-1 text-xs">
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      file.status === 'modified' && 'bg-amber-400',
                      file.status === 'added' && 'bg-green-400',
                      file.status === 'deleted' && 'bg-red-400'
                    )}
                  />
                  <span className="text-slate-300 font-mono truncate">{file.path}</span>
                  <span className="text-slate-500 text-[10px] ml-auto">{file.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Commit Form */}
          <div className="px-4 py-4 space-y-3">
            {/* Commit Title */}
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">
                Commit message <span className="text-red-400">*</span>
              </label>
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Brief description of changes"
                className="w-full px-3 py-2 bg-black/30 border border-border-dark rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                maxLength={72}
              />
              <p className="text-[10px] text-slate-500 mt-1 text-right">{message.length}/72</p>
            </div>

            {/* Extended Description */}
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">
                Extended description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details about your changes..."
                rows={3}
                className="w-full px-3 py-2 bg-black/30 border border-border-dark rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-border-dark bg-black/20 flex items-center justify-between">
            <p className="text-[10px] text-slate-500">
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[9px]">Ctrl</kbd>
              {' + '}
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[9px]">Enter</kbd>
              {' to commit'}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-sm text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!message.trim() || isCommitting}
                className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCommitting ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">
                      progress_activity
                    </span>
                    Committing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    Commit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CommitModal;
