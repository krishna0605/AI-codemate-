'use client';

import React, { useState } from 'react';
import { DEFAULT_SHORTCUTS, formatShortcutKeys } from '@/hooks/useKeyboardShortcuts';

interface ShortcutsPanelProps {
  onClose?: () => void;
}

export const ShortcutsPanel: React.FC<ShortcutsPanelProps> = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'editor', label: 'Editor', icon: 'edit' },
    { id: 'navigation', label: 'Navigation', icon: 'explore' },
    { id: 'ai', label: 'AI', icon: 'smart_toy' },
    { id: 'git', label: 'Git', icon: 'commit' },
    { id: 'general', label: 'General', icon: 'settings' },
  ];

  const filteredShortcuts = DEFAULT_SHORTCUTS.filter((shortcut) => {
    const matchesCategory = !selectedCategory || shortcut.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      shortcut.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shortcut.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const groupedShortcuts = categories
    .map((cat) => ({
      ...cat,
      shortcuts: filteredShortcuts.filter((s) => s.category === cat.id),
    }))
    .filter((cat) => !selectedCategory || cat.id === selectedCategory);

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Header */}
      <div className="p-3 border-b border-[#3e3e42] flex items-center justify-between">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">keyboard</span>
          Keyboard Shortcuts
        </h3>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="p-2 border-b border-[#3e3e42]">
        <input
          type="text"
          placeholder="Search shortcuts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#252526] border border-[#3e3e42] rounded px-2 py-1.5 text-xs text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Categories */}
      <div className="p-2 border-b border-[#3e3e42] flex gap-1 flex-wrap">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-2 py-1 text-[10px] rounded transition-colors ${
            !selectedCategory
              ? 'bg-blue-600 text-white'
              : 'bg-[#3e3e42] text-gray-400 hover:text-white'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-2 py-1 text-[10px] rounded flex items-center gap-1 transition-colors ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white'
                : 'bg-[#3e3e42] text-gray-400 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[12px]">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Shortcuts List */}
      <div className="flex-1 overflow-y-auto">
        {groupedShortcuts.map(
          (category) =>
            category.shortcuts.length > 0 && (
              <div key={category.id} className="p-2">
                <div className="flex items-center gap-2 px-2 py-1 mb-1">
                  <span className="material-symbols-outlined text-[14px] text-gray-500">
                    {category.icon}
                  </span>
                  <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                    {category.label}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {category.shortcuts.map((shortcut) => (
                    <div
                      key={shortcut.id}
                      className="flex items-center justify-between px-2 py-2 rounded hover:bg-[#2a2d2e] group"
                    >
                      <div>
                        <div className="text-sm text-white">{shortcut.name}</div>
                        <div className="text-[10px] text-gray-500">{shortcut.description}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, idx) => (
                          <React.Fragment key={key}>
                            <kbd className="px-1.5 py-0.5 text-[10px] bg-[#3e3e42] text-gray-300 rounded border border-[#4e4e52] font-mono">
                              {formatShortcutKeys([key])}
                            </kbd>
                            {idx < shortcut.keys.length - 1 && (
                              <span className="text-gray-500 text-[10px]">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
        )}

        {filteredShortcuts.length === 0 && (
          <p className="text-center text-gray-500 text-xs py-8">No shortcuts found</p>
        )}
      </div>

      {/* Footer tip */}
      <div className="p-2 border-t border-[#3e3e42] text-center">
        <p className="text-[10px] text-gray-500">
          Press <kbd className="px-1 py-0.5 bg-[#3e3e42] rounded text-gray-300">?</kbd> anywhere to
          show this panel
        </p>
      </div>
    </div>
  );
};
