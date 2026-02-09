'use client';

import React, { useState, useMemo } from 'react';
import { Tutorial, TutorialStep, TUTORIALS } from '@/lib/learning/tutorials';

interface TutorialPlayerProps {
  tutorialId?: string;
  onComplete?: (tutorialId: string) => void;
  onExit?: () => void;
}

export const TutorialPlayer: React.FC<TutorialPlayerProps> = ({
  tutorialId,
  onComplete,
  onExit,
}) => {
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(
    tutorialId ? TUTORIALS.find((t) => t.id === tutorialId) || null : null
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [userCode, setUserCode] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTutorials = useMemo(() => {
    if (!searchQuery) return TUTORIALS;
    return TUTORIALS.filter(
      (t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const currentStep: TutorialStep | null = selectedTutorial
    ? selectedTutorial.steps[currentStepIndex]
    : null;

  const progress = selectedTutorial
    ? Math.round((completedSteps.size / selectedTutorial.steps.length) * 100)
    : 0;

  const handleSelectTutorial = (tutorial: Tutorial) => {
    setSelectedTutorial(tutorial);
    setCurrentStepIndex(0);
    setCompletedSteps(new Set());
    setUserCode(tutorial.steps[0]?.code || '');
    setShowHint(false);
  };

  const handleCompleteStep = () => {
    if (!currentStep) return;

    const newCompleted = new Set(completedSteps);
    newCompleted.add(currentStep.id);
    setCompletedSteps(newCompleted);

    if (currentStepIndex < (selectedTutorial?.steps.length || 0) - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      setUserCode(selectedTutorial?.steps[nextIndex]?.code || '');
      setShowHint(false);
    } else {
      // Tutorial completed
      onComplete?.(selectedTutorial!.id);
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      setUserCode(selectedTutorial?.steps[prevIndex]?.code || '');
      setShowHint(false);
    }
  };

  const handleExitTutorial = () => {
    setSelectedTutorial(null);
    setCurrentStepIndex(0);
    setCompletedSteps(new Set());
    onExit?.();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-400 bg-green-900/30';
      case 'intermediate':
        return 'text-yellow-400 bg-yellow-900/30';
      case 'advanced':
        return 'text-red-400 bg-red-900/30';
      default:
        return 'text-gray-400 bg-gray-900/30';
    }
  };

  // Tutorial list view
  if (!selectedTutorial) {
    return (
      <div className="h-full flex flex-col bg-[#1e1e1e]">
        <div className="p-3 border-b border-[#3e3e42]">
          <h3 className="text-sm font-medium text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">school</span>
            Interactive Tutorials
          </h3>
        </div>

        <div className="p-2 border-b border-[#3e3e42]">
          <input
            type="text"
            placeholder="Search tutorials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#252526] border border-[#3e3e42] rounded px-2 py-1.5 text-xs text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredTutorials.map((tutorial) => (
            <div
              key={tutorial.id}
              onClick={() => handleSelectTutorial(tutorial)}
              className="p-3 rounded-lg border border-[#3e3e42] hover:border-blue-500 cursor-pointer transition-all hover:bg-[#2a2d2e]"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-medium text-white">{tutorial.title}</h4>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded ${getDifficultyColor(tutorial.difficulty)}`}
                >
                  {tutorial.difficulty}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2">{tutorial.description}</p>
              <div className="flex items-center gap-3 text-[10px] text-gray-600">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">schedule</span>
                  {tutorial.duration}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">
                    format_list_numbered
                  </span>
                  {tutorial.steps.length} steps
                </span>
                <span className="bg-[#3e3e42] px-1.5 py-0.5 rounded">{tutorial.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Tutorial player view
  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Header */}
      <div className="p-3 border-b border-[#3e3e42] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={handleExitTutorial} className="text-gray-400 hover:text-white">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
          <h3 className="text-sm font-medium text-white">{selectedTutorial.title}</h3>
        </div>
        <span className="text-xs text-gray-500">
          Step {currentStepIndex + 1} of {selectedTutorial.steps.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[#3e3e42]">
        <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
      </div>

      {/* Step content */}
      {currentStep && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <h4 className="text-lg font-medium text-white mb-2">{currentStep.title}</h4>
            <p className="text-sm text-gray-400">{currentStep.description}</p>
          </div>

          {/* Code block */}
          {currentStep.code && (
            <div className="rounded-lg overflow-hidden border border-[#3e3e42]">
              <div className="bg-[#252526] px-3 py-1.5 flex items-center justify-between">
                <span className="text-[10px] text-gray-500">{currentStep.language || 'code'}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(currentStep.code || '')}
                  className="text-gray-500 hover:text-white text-[10px] flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[12px]">content_copy</span>
                  Copy
                </button>
              </div>
              <pre className="p-3 bg-[#1e1e1e] overflow-x-auto">
                <code className="text-xs text-gray-300 font-mono whitespace-pre">
                  {currentStep.code}
                </code>
              </pre>
            </div>
          )}

          {/* Hint */}
          {currentStep.hint && (
            <div>
              {showHint ? (
                <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <p className="text-xs text-blue-300 flex items-start gap-2">
                    <span className="material-symbols-outlined text-[14px]">lightbulb</span>
                    {currentStep.hint}
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => setShowHint(true)}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">help</span>
                  Show hint
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="p-3 border-t border-[#3e3e42] flex items-center justify-between">
        <button
          onClick={handlePreviousStep}
          disabled={currentStepIndex === 0}
          className="px-3 py-1.5 text-xs text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[14px]">chevron_left</span>
          Previous
        </button>
        <button
          onClick={handleCompleteStep}
          className="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-1"
        >
          {currentStepIndex === selectedTutorial.steps.length - 1 ? 'Complete' : 'Next'}
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        </button>
      </div>
    </div>
  );
};
