'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Snippet, DEFAULT_SNIPPETS, generateSnippetId } from '@/lib/productivity/snippets';

interface SnippetLibraryProps {
  onInsertSnippet?: (code: string, language: string) => void;
}

export const SnippetLibrary: React.FC<SnippetLibraryProps> = ({ onInsertSnippet }) => {
  const [snippets, setSnippets] = useState<Snippet[]>(DEFAULT_SNIPPETS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Snippet>>({});

  // Get unique languages
  const languages = useMemo(() => {
    const langs = new Set(snippets.map((s) => s.language));
    return Array.from(langs).sort();
  }, [snippets]);

  // Filter snippets
  const filteredSnippets = useMemo(() => {
    return snippets.filter((snippet) => {
      const matchesSearch =
        searchQuery === '' ||
        snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        snippet.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesLanguage = !selectedLanguage || snippet.language === selectedLanguage;
      return matchesSearch && matchesLanguage;
    });
  }, [snippets, searchQuery, selectedLanguage]);

  // Create new snippet
  const handleCreate = useCallback(() => {
    setEditForm({
      title: '',
      description: '',
      language: 'typescript',
      code: '',
      tags: [],
    });
    setIsEditing(true);
    setSelectedSnippet(null);
  }, []);

  // Edit existing snippet
  const handleEdit = useCallback((snippet: Snippet) => {
    setEditForm({ ...snippet });
    setIsEditing(true);
  }, []);

  // Save snippet (create or update)
  const handleSave = useCallback(() => {
    if (!editForm.title || !editForm.code) return;

    const now = Date.now();
    if (selectedSnippet) {
      // Update existing
      setSnippets((prev) =>
        prev.map((s) =>
          s.id === selectedSnippet.id ? ({ ...s, ...editForm, updatedAt: now } as Snippet) : s
        )
      );
      setSelectedSnippet({ ...selectedSnippet, ...editForm, updatedAt: now } as Snippet);
    } else {
      // Create new
      const newSnippet: Snippet = {
        id: generateSnippetId(),
        title: editForm.title!,
        description: editForm.description || '',
        language: editForm.language || 'typescript',
        code: editForm.code!,
        tags: editForm.tags || [],
        createdAt: now,
        updatedAt: now,
      };
      setSnippets((prev) => [newSnippet, ...prev]);
      setSelectedSnippet(newSnippet);
    }
    setIsEditing(false);
  }, [editForm, selectedSnippet]);

  // Delete snippet
  const handleDelete = useCallback(
    (id: string) => {
      setSnippets((prev) => prev.filter((s) => s.id !== id));
      if (selectedSnippet?.id === id) {
        setSelectedSnippet(null);
      }
    },
    [selectedSnippet]
  );

  // Insert snippet into editor
  const handleInsert = useCallback(
    (snippet: Snippet) => {
      onInsertSnippet?.(snippet.code, snippet.language);
    },
    [onInsertSnippet]
  );

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Header */}
      <div className="p-3 border-b border-[#3e3e42] flex items-center justify-between">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">code_blocks</span>
          Snippets
        </h3>
        <button
          onClick={handleCreate}
          className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[14px]">add</span>
          New
        </button>
      </div>

      {/* Search and Filter */}
      <div className="p-2 border-b border-[#3e3e42] space-y-2">
        <input
          type="text"
          placeholder="Search snippets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#252526] border border-[#3e3e42] rounded px-2 py-1.5 text-xs text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
        />
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setSelectedLanguage(null)}
            className={`px-2 py-0.5 text-[10px] rounded transition-colors ${
              !selectedLanguage
                ? 'bg-blue-600 text-white'
                : 'bg-[#3e3e42] text-gray-400 hover:text-white'
            }`}
          >
            All
          </button>
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-2 py-0.5 text-[10px] rounded transition-colors ${
                selectedLanguage === lang
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#3e3e42] text-gray-400 hover:text-white'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Snippet List */}
        <div className="w-1/2 border-r border-[#3e3e42] overflow-y-auto">
          {filteredSnippets.length === 0 ? (
            <p className="text-center text-gray-500 text-xs py-8">No snippets found</p>
          ) : (
            filteredSnippets.map((snippet) => (
              <div
                key={snippet.id}
                onClick={() => {
                  setSelectedSnippet(snippet);
                  setIsEditing(false);
                }}
                className={`p-2 border-b border-[#3e3e42] cursor-pointer transition-colors ${
                  selectedSnippet?.id === snippet.id
                    ? 'bg-blue-600/20 border-l-2 border-l-blue-500'
                    : 'hover:bg-[#2a2d2e]'
                }`}
              >
                <div className="text-sm text-white font-medium truncate">{snippet.title}</div>
                <div className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-2">
                  <span className="bg-[#3e3e42] px-1 rounded">{snippet.language}</span>
                  {snippet.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-blue-400">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Snippet Detail / Editor */}
        <div className="w-1/2 flex flex-col">
          {isEditing ? (
            <div className="flex-1 p-3 overflow-y-auto space-y-3">
              <input
                type="text"
                placeholder="Title"
                value={editForm.title || ''}
                onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full bg-[#252526] border border-[#3e3e42] rounded px-2 py-1.5 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={editForm.description || ''}
                onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full bg-[#252526] border border-[#3e3e42] rounded px-2 py-1.5 text-xs text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
              />
              <select
                value={editForm.language || 'typescript'}
                onChange={(e) => setEditForm((prev) => ({ ...prev, language: e.target.value }))}
                className="w-full bg-[#252526] border border-[#3e3e42] rounded px-2 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="typescript">TypeScript</option>
                <option value="typescriptreact">TypeScript React</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="css">CSS</option>
                <option value="html">HTML</option>
              </select>
              <textarea
                placeholder="Code..."
                value={editForm.code || ''}
                onChange={(e) => setEditForm((prev) => ({ ...prev, code: e.target.value }))}
                className="w-full h-40 bg-[#252526] border border-[#3e3e42] rounded px-2 py-1.5 text-xs text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none font-mono resize-none"
              />
              <input
                type="text"
                placeholder="Tags (comma-separated)"
                value={editForm.tags?.join(', ') || ''}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    tags: e.target.value
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean),
                  }))
                }
                className="w-full bg-[#252526] border border-[#3e3e42] rounded px-2 py-1.5 text-xs text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={!editForm.title || !editForm.code}
                  className="flex-1 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : selectedSnippet ? (
            <div className="flex-1 flex flex-col">
              <div className="p-3 border-b border-[#3e3e42]">
                <h4 className="text-sm font-medium text-white">{selectedSnippet.title}</h4>
                {selectedSnippet.description && (
                  <p className="text-xs text-gray-500 mt-1">{selectedSnippet.description}</p>
                )}
                <div className="flex gap-1 mt-2">
                  {selectedSnippet.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] bg-blue-900/30 text-blue-300 px-1.5 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex-1 overflow-auto p-3 bg-[#252526]">
                <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                  {selectedSnippet.code}
                </pre>
              </div>
              <div className="p-2 border-t border-[#3e3e42] flex gap-2">
                <button
                  onClick={() => handleInsert(selectedSnippet)}
                  className="flex-1 px-2 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">content_paste</span>
                  Insert
                </button>
                <button
                  onClick={() => handleEdit(selectedSnippet)}
                  className="px-2 py-1.5 text-xs bg-[#3e3e42] hover:bg-[#4e4e52] text-white rounded transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(selectedSnippet.id)}
                  className="px-2 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <p className="text-xs">Select a snippet to view</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
