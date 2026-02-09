'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Activity types matching database schema
export type ActivityType =
  | 'file_opened'
  | 'file_saved'
  | 'file_created'
  | 'file_deleted'
  | 'repo_loaded'
  | 'branch_switched'
  | 'commit_made'
  | 'ai_chat_started'
  | 'ai_response_received'
  | 'error_detected'
  | 'build_started'
  | 'build_completed';

export interface ActivityLog {
  id: string;
  actionType: ActivityType;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

interface ActivityLogContextType {
  activities: ActivityLog[];
  logActivity: (
    type: ActivityType,
    title: string,
    description?: string,
    metadata?: Record<string, unknown>
  ) => void;
  clearActivities: () => void;
  getRecentActivities: (limit?: number) => ActivityLog[];
}

const ActivityLogContext = createContext<ActivityLogContextType | null>(null);

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 11);

// Format relative time
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export function ActivityLogProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  // Log a new activity
  const logActivity = useCallback(
    (
      actionType: ActivityType,
      title: string,
      description?: string,
      metadata?: Record<string, unknown>
    ) => {
      const newActivity: ActivityLog = {
        id: generateId(),
        actionType,
        title,
        description,
        metadata,
        createdAt: new Date(),
      };

      setActivities((prev) => [newActivity, ...prev].slice(0, 100)); // Keep last 100
    },
    []
  );

  // Clear all activities
  const clearActivities = useCallback(() => {
    setActivities([]);
  }, []);

  // Get recent activities with optional limit
  const getRecentActivities = useCallback(
    (limit: number = 20): ActivityLog[] => {
      return activities.slice(0, limit);
    },
    [activities]
  );

  const value: ActivityLogContextType = {
    activities,
    logActivity,
    clearActivities,
    getRecentActivities,
  };

  return <ActivityLogContext.Provider value={value}>{children}</ActivityLogContext.Provider>;
}

export function useActivityLog() {
  const context = useContext(ActivityLogContext);
  if (!context) {
    throw new Error('useActivityLog must be used within an ActivityLogProvider');
  }
  return context;
}
