'use client';

import React, { useState } from 'react';
import { ProjectTemplate, PROJECT_TEMPLATES } from '@/lib/productivity/templates';

interface TemplateGalleryProps {
  onSelectTemplate?: (template: ProjectTemplate) => void;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onSelectTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'frontend', label: 'Frontend', icon: 'web' },
    { id: 'backend', label: 'Backend', icon: 'dns' },
    { id: 'fullstack', label: 'Full Stack', icon: 'layers' },
    { id: 'library', label: 'Library', icon: 'inventory_2' },
  ];

  const filteredTemplates = PROJECT_TEMPLATES.filter((template) => {
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.framework.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUseTemplate = (template: ProjectTemplate) => {
    onSelectTemplate?.(template);
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Header */}
      <div className="p-3 border-b border-[#3e3e42]">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">folder_special</span>
          Project Templates
        </h3>
      </div>

      {/* Search */}
      <div className="p-2 border-b border-[#3e3e42]">
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#252526] border border-[#3e3e42] rounded px-2 py-1.5 text-xs text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Categories */}
      <div className="p-2 border-b border-[#3e3e42] flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-2 py-1 text-xs rounded flex items-center gap-1 transition-colors ${
            !selectedCategory
              ? 'bg-blue-600 text-white'
              : 'bg-[#3e3e42] text-gray-400 hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">apps</span>
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-2 py-1 text-xs rounded flex items-center gap-1 transition-colors ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white'
                : 'bg-[#3e3e42] text-gray-400 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {filteredTemplates.length === 0 ? (
          <p className="text-center text-gray-500 text-xs py-8">No templates found</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedTemplate?.id === template.id
                    ? 'border-blue-500 bg-blue-600/10'
                    : 'border-[#3e3e42] hover:border-[#4e4e52] hover:bg-[#2a2d2e]'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[24px] text-blue-400">
                    {template.icon}
                  </span>
                  <div>
                    <h4 className="text-sm font-medium text-white">{template.name}</h4>
                    <span className="text-[10px] text-gray-500">{template.framework}</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 line-clamp-2">{template.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Template Preview */}
      {selectedTemplate && (
        <div className="border-t border-[#3e3e42] p-3 bg-[#252526]">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-white">{selectedTemplate.name}</h4>
            <span className="text-[10px] bg-[#3e3e42] text-gray-400 px-2 py-0.5 rounded">
              {selectedTemplate.files.length} files
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-3">{selectedTemplate.description}</p>

          {/* File list preview */}
          <div className="bg-[#1e1e1e] rounded p-2 mb-3 max-h-24 overflow-y-auto">
            {selectedTemplate.files.map((file) => (
              <div
                key={file.path}
                className="text-[10px] text-gray-500 font-mono py-0.5 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[12px]">description</span>
                {file.path}
              </div>
            ))}
          </div>

          <button
            onClick={() => handleUseTemplate(selectedTemplate)}
            className="w-full px-3 py-2 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">play_arrow</span>
            Use This Template
          </button>
        </div>
      )}
    </div>
  );
};
