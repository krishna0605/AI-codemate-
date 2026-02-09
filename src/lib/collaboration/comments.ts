export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorEmail: string; // Used for avatar/gravatar
  content: string;
  timestamp: number;
}

export interface CommentThread {
  id: string;
  filePath: string;
  lineNumber: number; // 1-indexed
  status: 'open' | 'resolved';
  comments: Comment[];
  createdAt: number;
}

// Helper to generate a unique ID
export const generateId = () => Math.random().toString(36).substr(2, 9);
