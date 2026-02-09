'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Tip, TIPS, getRandomTip } from '@/lib/learning/tips';

interface TipOfTheDayProps {
  language?: string;
  onDismiss?: () => void;
}

export const TipOfTheDay: React.FC<TipOfTheDayProps> = ({ language, onDismiss }) => {
  const [tip, setTip] = useState<Tip | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if tip was dismissed today
    const lastDismissed = localStorage.getItem('tipOfTheDay_dismissed');
    const today = new Date().toDateString();

    if (lastDismissed !== today) {
      setTip(getRandomTip(language));
      setIsDismissed(false);
    } else {
      setIsDismissed(true);
    }
  }, [language]);

  const handleDismiss = useCallback(() => {
    localStorage.setItem('tipOfTheDay_dismissed', new Date().toDateString());
    setIsDismissed(true);
    onDismiss?.();
  }, [onDismiss]);

  const handleNextTip = useCallback(() => {
    setTip(getRandomTip(language));
  }, [language]);

  if (isDismissed || !tip) return null;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'performance':
        return 'text-green-400 bg-green-900/30';
      case 'security':
        return 'text-red-400 bg-red-900/30';
      case 'best-practice':
        return 'text-blue-400 bg-blue-900/30';
      case 'tooling':
        return 'text-purple-400 bg-purple-900/30';
      case 'language':
        return 'text-yellow-400 bg-yellow-900/30';
      default:
        return 'text-gray-400 bg-gray-900/30';
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-4 m-3">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-yellow-400">lightbulb</span>
          <h4 className="text-sm font-medium text-white">Tip of the Day</h4>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-500 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>

      <p className="text-sm text-white mb-2">{tip.title}</p>
      <p className="text-xs text-gray-400 mb-3">{tip.content}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${getCategoryColor(tip.category)}`}>
            {tip.category}
          </span>
          {tip.language && (
            <span className="text-[10px] text-gray-500 bg-[#3e3e42] px-1.5 py-0.5 rounded">
              {tip.language}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {tip.docLink && (
            <a
              href={tip.docLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              Learn more
              <span className="material-symbols-outlined text-[12px]">open_in_new</span>
            </a>
          )}
          <button
            onClick={handleNextTip}
            className="text-[10px] text-gray-400 hover:text-white flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[12px]">refresh</span>
            Next tip
          </button>
        </div>
      </div>
    </div>
  );
};

// Browse all tips
export const TipsBrowser: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = ['performance', 'security', 'best-practice', 'tooling', 'language'];

  const filteredTips = selectedCategory
    ? TIPS.filter((t) => t.category === selectedCategory)
    : TIPS;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'performance':
        return 'text-green-400 bg-green-900/30';
      case 'security':
        return 'text-red-400 bg-red-900/30';
      case 'best-practice':
        return 'text-blue-400 bg-blue-900/30';
      case 'tooling':
        return 'text-purple-400 bg-purple-900/30';
      case 'language':
        return 'text-yellow-400 bg-yellow-900/30';
      default:
        return 'text-gray-400 bg-gray-900/30';
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      <div className="p-3 border-b border-[#3e3e42]">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">tips_and_updates</span>
          Best Practice Tips
        </h3>
      </div>

      {/* Category filter */}
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
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2 py-1 text-[10px] rounded transition-colors ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white'
                : 'bg-[#3e3e42] text-gray-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tips list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredTips.map((tip) => (
          <div
            key={tip.id}
            className="p-3 rounded-lg border border-[#3e3e42] hover:border-[#4e4e52] transition-colors"
          >
            <div className="flex items-start justify-between mb-1">
              <h4 className="text-sm font-medium text-white">{tip.title}</h4>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded ${getCategoryColor(tip.category)}`}
              >
                {tip.category}
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-2">{tip.content}</p>
            <div className="flex items-center gap-2">
              {tip.language && (
                <span className="text-[10px] text-gray-600 bg-[#252526] px-1.5 py-0.5 rounded">
                  {tip.language}
                </span>
              )}
              {tip.docLink && (
                <a
                  href={tip.docLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-blue-400 hover:text-blue-300"
                >
                  Docs →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
