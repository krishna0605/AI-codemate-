'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { CodeChallenge, CHALLENGES } from '@/lib/learning/challenges';

interface ChallengeModeProps {
  onComplete?: (challengeId: string, success: boolean) => void;
}

export const ChallengeMode: React.FC<ChallengeModeProps> = ({ onComplete }) => {
  const [selectedChallenge, setSelectedChallenge] = useState<CodeChallenge | null>(null);
  const [userCode, setUserCode] = useState('');
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showHints, setShowHints] = useState<number>(0);
  const [showSolution, setShowSolution] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [filterType, setFilterType] = useState<string | null>(null);

  const filteredChallenges = useMemo(() => {
    if (!filterType) return CHALLENGES;
    return CHALLENGES.filter((c) => c.type === filterType);
  }, [filterType]);

  // Timer effect
  useEffect(() => {
    if (!selectedChallenge || timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedChallenge, timeRemaining]);

  const handleStartChallenge = (challenge: CodeChallenge) => {
    setSelectedChallenge(challenge);
    setUserCode(challenge.starterCode);
    setTimeRemaining(challenge.timeLimit ? challenge.timeLimit * 60 : null);
    setShowHints(0);
    setShowSolution(false);
    setIsSubmitted(false);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    // Basic validation - in a real app, this would run tests
    const passed = userCode.length > selectedChallenge!.starterCode.length;
    onComplete?.(selectedChallenge!.id, passed);
  };

  const handleExit = () => {
    setSelectedChallenge(null);
    setUserCode('');
    setTimeRemaining(null);
    setShowHints(0);
    setShowSolution(false);
    setIsSubmitted(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-400 bg-green-900/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-900/30';
      case 'hard':
        return 'text-red-400 bg-red-900/30';
      default:
        return 'text-gray-400 bg-gray-900/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug-hunt':
        return 'bug_report';
      case 'refactor':
        return 'construction';
      case 'build':
        return 'deployed_code';
      case 'algorithm':
        return 'functions';
      default:
        return 'code';
    }
  };

  // Challenge list view
  if (!selectedChallenge) {
    return (
      <div className="h-full flex flex-col bg-[#1e1e1e]">
        <div className="p-3 border-b border-[#3e3e42]">
          <h3 className="text-sm font-medium text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">trophy</span>
            Code Challenges
          </h3>
        </div>

        {/* Filter */}
        <div className="p-2 border-b border-[#3e3e42] flex gap-1 flex-wrap">
          <button
            onClick={() => setFilterType(null)}
            className={`px-2 py-1 text-[10px] rounded transition-colors ${
              !filterType ? 'bg-blue-600 text-white' : 'bg-[#3e3e42] text-gray-400 hover:text-white'
            }`}
          >
            All
          </button>
          {['bug-hunt', 'refactor', 'build', 'algorithm'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2 py-1 text-[10px] rounded flex items-center gap-1 transition-colors ${
                filterType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#3e3e42] text-gray-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[12px]">{getTypeIcon(type)}</span>
              {type}
            </button>
          ))}
        </div>

        {/* Challenges list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredChallenges.map((challenge) => (
            <div
              key={challenge.id}
              className="p-3 rounded-lg border border-[#3e3e42] hover:border-blue-500 cursor-pointer transition-all hover:bg-[#2a2d2e]"
              onClick={() => handleStartChallenge(challenge)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-blue-400">
                    {getTypeIcon(challenge.type)}
                  </span>
                  <h4 className="text-sm font-medium text-white">{challenge.title}</h4>
                </div>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded ${getDifficultyColor(challenge.difficulty)}`}
                >
                  {challenge.difficulty}
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-2">{challenge.description}</p>
              <div className="flex items-center gap-3 text-[10px] text-gray-600">
                {challenge.timeLimit && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">timer</span>
                    {challenge.timeLimit} min
                  </span>
                )}
                <span className="bg-[#3e3e42] px-1.5 py-0.5 rounded">{challenge.language}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Challenge player view
  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Header */}
      <div className="p-3 border-b border-[#3e3e42] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={handleExit} className="text-gray-400 hover:text-white">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
          <h3 className="text-sm font-medium text-white">{selectedChallenge.title}</h3>
        </div>
        {timeRemaining !== null && (
          <div
            className={`text-sm font-mono ${timeRemaining < 60 ? 'text-red-400' : 'text-white'}`}
          >
            ⏱ {formatTime(timeRemaining)}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="p-3 border-b border-[#3e3e42] bg-[#252526]">
        <p className="text-xs text-gray-400">{selectedChallenge.description}</p>
      </div>

      {/* Code editor area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <textarea
          value={userCode}
          onChange={(e) => setUserCode(e.target.value)}
          disabled={isSubmitted || timeRemaining === 0}
          className="flex-1 w-full p-3 bg-[#1e1e1e] text-white font-mono text-xs resize-none focus:outline-none disabled:opacity-50"
          placeholder="Write your solution here..."
        />
      </div>

      {/* Hints */}
      {selectedChallenge.hints && selectedChallenge.hints.length > 0 && !isSubmitted && (
        <div className="p-2 border-t border-[#3e3e42]">
          {showHints < selectedChallenge.hints.length ? (
            <button
              onClick={() => setShowHints((prev) => prev + 1)}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">help</span>
              Show hint ({showHints}/{selectedChallenge.hints.length})
            </button>
          ) : null}
          {showHints > 0 && (
            <div className="mt-2 space-y-1">
              {selectedChallenge.hints.slice(0, showHints).map((hint, idx) => (
                <p key={idx} className="text-xs text-blue-300 bg-blue-900/20 p-2 rounded">
                  💡 {hint}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Result / Solution */}
      {isSubmitted && (
        <div className="p-3 border-t border-[#3e3e42] bg-green-900/20">
          <p className="text-sm text-green-400 mb-2">✅ Challenge completed! Good job!</p>
          {selectedChallenge.solution && !showSolution && (
            <button
              onClick={() => setShowSolution(true)}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              View solution →
            </button>
          )}
          {showSolution && selectedChallenge.solution && (
            <pre className="mt-2 p-2 bg-[#1e1e1e] rounded text-xs text-gray-300 font-mono overflow-x-auto">
              {selectedChallenge.solution}
            </pre>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="p-3 border-t border-[#3e3e42] flex items-center justify-between">
        <button onClick={handleExit} className="px-3 py-1.5 text-xs text-gray-400 hover:text-white">
          Exit
        </button>
        {!isSubmitted && (
          <button
            onClick={handleSubmit}
            disabled={timeRemaining === 0}
            className="px-4 py-1.5 text-xs bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">check</span>
            Submit
          </button>
        )}
      </div>
    </div>
  );
};
