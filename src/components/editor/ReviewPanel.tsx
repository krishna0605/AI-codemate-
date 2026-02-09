import React from 'react';
import { CommentThread } from '@/lib/collaboration/comments';

interface ReviewPanelProps {
  threads: CommentThread[];
  onSelectThread: (threadId: string) => void;
  onDeleteThread: (threadId: string) => void;
  currentUserId: string;
}

export const ReviewPanel: React.FC<ReviewPanelProps> = ({
  threads,
  onSelectThread,
  onDeleteThread,
  currentUserId,
}) => {
  if (threads.length === 0) {
    return <div className="p-4 text-center text-gray-500 text-xs">No comments in this file.</div>;
  }

  return (
    <div className="flex flex-col h-full bg-[#252526] border-l border-[#1e1e1e] w-64">
      <div className="p-2 font-semibold text-xs text-gray-400 uppercase tracking-wider border-b border-[#1e1e1e]">
        Comments
      </div>
      <div className="flex-1 overflow-y-auto">
        {threads.map((thread) => (
          <div
            key={thread.id}
            className="p-3 border-b border-[#3e3e42] hover:bg-[#2a2d2e] cursor-pointer group"
            onClick={() => onSelectThread(thread.id)}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-mono text-blue-400">Line {thread.lineNumber}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded ${
                  thread.status === 'resolved'
                    ? 'bg-green-900/30 text-green-400'
                    : 'bg-yellow-900/30 text-yellow-400'
                }`}
              >
                {thread.status}
              </span>
            </div>

            <div className="text-sm text-gray-300 line-clamp-2 mb-2">
              {thread.comments[0]?.content || 'No content'}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{thread.comments.length} replies</span>
              <span className="text-[10px]">{new Date(thread.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
