import React, { useState } from 'react';
import { Comment, CommentThread } from '@/lib/collaboration/comments';

interface CommentThreadProps {
  thread: CommentThread;
  currentUser: { id: string; name: string; email: string };
  onAddComment: (content: string) => void;
  onResolve: () => void;
  onClose: () => void;
}

export const CommentThreadView: React.FC<CommentThreadProps> = ({
  thread,
  currentUser,
  onAddComment,
  onResolve,
  onClose,
}) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(newComment);
    setNewComment('');
  };

  return (
    <div className="bg-[#1e1e1e] border border-[#3e3e42] rounded-md shadow-lg w-[300px] flex flex-col text-sm text-gray-300 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#3e3e42] bg-[#252526]">
        <span className="font-semibold text-xs text-gray-400">
          Ln {thread.lineNumber} • {thread.comments.length} comments
        </span>
        <div className="flex gap-1">
          <button
            onClick={onResolve}
            className="hover:bg-green-900/30 hover:text-green-400 p-1 rounded text-xs transition-colors"
            title="Resolve Thread"
          >
            <span className="material-symbols-outlined text-[16px]">check</span>
          </button>
          <button onClick={onClose} className="hover:bg-[#3e3e42] p-1 rounded transition-colors">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto max-h-[300px] p-3 space-y-4">
        {thread.comments.map((comment) => (
          <div key={comment.id} className="flex gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 select-none text-white`}
              style={{ backgroundColor: stringToColor(comment.authorEmail) }}
            >
              {comment.authorName[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className="font-medium text-gray-200">{comment.authorName}</span>
                <span className="text-[10px] text-gray-500">
                  {new Date(comment.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="text-gray-300 whitespace-pre-wrap leading-tight">
                {comment.content}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-[#3e3e42] bg-[#252526]">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Reply..."
          className="w-full bg-[#3e3e42] rounded border border-transparent focus:border-[#007acc] focus:outline-none p-2 text-gray-200 placeholder-gray-500 text-xs min-h-[60px] resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="bg-[#007acc] hover:bg-[#0062a3] text-white px-3 py-1 rounded text-xs font-medium disabled:opacity-50 transition-colors"
          >
            Comment
          </button>
        </div>
      </form>
    </div>
  );
};

// Helper: Consistent color from string
function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return '#' + '00000'.substring(0, 6 - c.length) + c;
}
