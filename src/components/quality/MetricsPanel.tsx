'use client';

import React, { useMemo } from 'react';
import { useRepository } from '@/hooks/useRepository';
import {
  calculateFileMetrics,
  FileMetrics,
  getComplexityRating,
  getComplexityColor,
} from '@/lib/analysis/metrics';

export const MetricsPanel: React.FC = () => {
  const { currentFile } = useRepository();

  const metrics: FileMetrics | null = useMemo(() => {
    if (!currentFile?.content || !currentFile?.path) return null;
    return calculateFileMetrics(currentFile.content, currentFile.path);
  }, [currentFile?.content, currentFile?.path]);

  if (!metrics) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-sm p-4">
        <p>Open a file to view metrics</p>
      </div>
    );
  }

  const complexityRating = getComplexityRating(metrics.maxComplexity);
  const complexityColor = getComplexityColor(complexityRating);

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-gray-300 font-sans overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-[#3e3e42]">
        <h2 className="text-lg font-semibold text-white">File Metrics</h2>
        <p className="text-xs text-gray-500 mt-1 truncate" title={metrics.filePath}>
          {metrics.filePath.split('/').pop()}
        </p>
      </div>

      {/* LOC Stats */}
      <div className="p-4 border-b border-[#3e3e42]">
        <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Lines of Code</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#252526] p-3 rounded">
            <div className="text-xl font-bold text-blue-400">{metrics.codeLOC}</div>
            <div className="text-xs text-gray-500">Code Lines</div>
          </div>
          <div className="bg-[#252526] p-3 rounded">
            <div className="text-xl font-bold text-gray-400">{metrics.blankLines}</div>
            <div className="text-xs text-gray-500">Blank Lines</div>
          </div>
          <div className="bg-[#252526] p-3 rounded">
            <div className="text-xl font-bold text-green-400">{metrics.commentLines}</div>
            <div className="text-xs text-gray-500">Comment Lines</div>
          </div>
          <div className="bg-[#252526] p-3 rounded">
            <div className="text-xl font-bold text-purple-400">{metrics.importCount}</div>
            <div className="text-xs text-gray-500">Imports</div>
          </div>
        </div>
      </div>

      {/* Complexity Overview */}
      <div className="p-4 border-b border-[#3e3e42]">
        <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Complexity</h3>
        <div className="flex gap-3">
          <div className="flex-1 bg-[#252526] p-3 rounded">
            <div className={`text-xl font-bold ${complexityColor}`}>{metrics.maxComplexity}</div>
            <div className="text-xs text-gray-500">Max Complexity</div>
          </div>
          <div className="flex-1 bg-[#252526] p-3 rounded">
            <div className="text-xl font-bold text-yellow-400">{metrics.averageComplexity}</div>
            <div className="text-xs text-gray-500">Average</div>
          </div>
        </div>
        {metrics.maxComplexity > 10 && (
          <div className="mt-3 p-2 bg-orange-900/20 rounded text-xs text-orange-300 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">warning</span>
            Consider refactoring functions with complexity &gt; 10
          </div>
        )}
      </div>

      {/* Functions List */}
      <div className="p-4">
        <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">
          Functions ({metrics.functions.length})
        </h3>
        {metrics.functions.length === 0 ? (
          <p className="text-sm text-gray-500">No functions found</p>
        ) : (
          <div className="space-y-2">
            {metrics.functions.map((fn, idx) => {
              const rating = getComplexityRating(fn.cyclomaticComplexity);
              const color = getComplexityColor(rating);
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-[#252526] rounded hover:bg-[#2a2d2e] transition-colors"
                >
                  <div>
                    <div className="text-sm font-mono text-blue-400">{fn.name}</div>
                    <div className="text-xs text-gray-500">
                      Lines {fn.startLine}-{fn.endLine} ({fn.loc} LOC)
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${color}`}>CC: {fn.cyclomaticComplexity}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
