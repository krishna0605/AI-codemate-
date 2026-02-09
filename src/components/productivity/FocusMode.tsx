'use client';

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';

interface FocusModeContextType {
  isFocusMode: boolean;
  toggleFocusMode: () => void;
  enableFocusMode: () => void;
  disableFocusMode: () => void;
  dimLevel: number;
  setDimLevel: (level: number) => void;
}

const FocusModeContext = createContext<FocusModeContextType | null>(null);

export function useFocusMode() {
  const context = useContext(FocusModeContext);
  if (!context) {
    throw new Error('useFocusMode must be used within a FocusModeProvider');
  }
  return context;
}

interface FocusModeProviderProps {
  children: React.ReactNode;
}

export const FocusModeProvider: React.FC<FocusModeProviderProps> = ({ children }) => {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [dimLevel, setDimLevel] = useState(0.5); // 0 to 1

  const toggleFocusMode = useCallback(() => {
    setIsFocusMode((prev) => !prev);
  }, []);

  const enableFocusMode = useCallback(() => {
    setIsFocusMode(true);
  }, []);

  const disableFocusMode = useCallback(() => {
    setIsFocusMode(false);
  }, []);

  // Handle F11 shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFocusMode();
      }
      // Escape to exit focus mode
      if (e.key === 'Escape' && isFocusMode) {
        disableFocusMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFocusMode, disableFocusMode, isFocusMode]);

  return (
    <FocusModeContext.Provider
      value={{
        isFocusMode,
        toggleFocusMode,
        enableFocusMode,
        disableFocusMode,
        dimLevel,
        setDimLevel,
      }}
    >
      {children}
      {isFocusMode && <FocusModeOverlay dimLevel={dimLevel} onExit={disableFocusMode} />}
    </FocusModeContext.Provider>
  );
};

// The overlay that dims non-editor content
interface FocusModeOverlayProps {
  dimLevel: number;
  onExit: () => void;
}

const FocusModeOverlay: React.FC<FocusModeOverlayProps> = ({ dimLevel, onExit }) => {
  return (
    <>
      {/* Dim overlay for sidebars */}
      <style jsx global>{`
        .focus-mode-active .sidebar,
        .focus-mode-active aside,
        .focus-mode-active [data-focus-dim='true'] {
          opacity: ${1 - dimLevel};
          transition: opacity 0.3s ease;
        }

        .focus-mode-active .sidebar:hover,
        .focus-mode-active aside:hover,
        .focus-mode-active [data-focus-dim='true']:hover {
          opacity: 1;
        }

        .focus-mode-active [data-focus-protected='true'] {
          opacity: 1 !important;
        }
      `}</style>

      {/* Exit button */}
      <button
        onClick={onExit}
        className="fixed top-4 right-4 z-[9999] px-3 py-1.5 bg-[#1e1e1e]/80 hover:bg-[#2a2d2e] border border-[#3e3e42] rounded-full text-xs text-white flex items-center gap-1.5 transition-all opacity-30 hover:opacity-100"
      >
        <span className="material-symbols-outlined text-[14px]">fullscreen_exit</span>
        Exit Focus (Esc)
      </button>
    </>
  );
};

// Focus Mode Settings Panel
interface FocusModeSettingsProps {
  className?: string;
}

export const FocusModeSettings: React.FC<FocusModeSettingsProps> = ({ className }) => {
  const { isFocusMode, toggleFocusMode, dimLevel, setDimLevel } = useFocusMode();

  return (
    <div className={`bg-[#1e1e1e] rounded-lg border border-[#3e3e42] p-4 ${className || ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-blue-400">
            center_focus_strong
          </span>
          <h3 className="text-sm font-medium text-white">Focus Mode</h3>
        </div>
        <button
          onClick={toggleFocusMode}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            isFocusMode ? 'bg-blue-600' : 'bg-[#3e3e42]'
          }`}
        >
          <div
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              isFocusMode ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      <p className="text-xs text-gray-500 mb-4">
        Dim sidebars and panels to focus on your code. Press F11 or Escape to toggle.
      </p>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-400 block mb-1">Dim Level</label>
          <input
            type="range"
            min="0"
            max="100"
            value={dimLevel * 100}
            onChange={(e) => setDimLevel(Number(e.target.value) / 100)}
            className="w-full h-1 bg-[#3e3e42] rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-gray-600 mt-1">
            <span>Light</span>
            <span>{Math.round(dimLevel * 100)}%</span>
            <span>Dark</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-[#3e3e42]">
        <p className="text-[10px] text-gray-600">
          <kbd className="px-1 py-0.5 bg-[#3e3e42] rounded">F11</kbd> Toggle Focus Mode
          <br />
          <kbd className="px-1 py-0.5 bg-[#3e3e42] rounded">Esc</kbd> Exit Focus Mode
        </p>
      </div>
    </div>
  );
};
