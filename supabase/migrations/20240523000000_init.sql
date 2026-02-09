-- ============================================
-- AI CODEMATE - COMPLETE DATABASE SCHEMA
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================

-- ============================================
-- PART 1: USER PROFILES (Already created)
-- ============================================

-- 1. USER PROFILES TABLE (stores basic user info)
-- This extends the built-in auth.users table with additional profile data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  name TEXT,
  avatar_url TEXT,
  github_username TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can insert their own profile (for initial creation)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);


-- ============================================
-- PART 2: USER PROJECTS
-- ============================================

-- Projects table - tracks which repos users work on
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  github_repo_full_name TEXT NOT NULL,  -- e.g., "owner/repo"
  github_repo_id TEXT,                   -- GitHub's repo ID
  description TEXT,
  language TEXT,
  default_branch TEXT DEFAULT 'main',
  is_favorite BOOLEAN DEFAULT FALSE,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique repo per user
  UNIQUE(user_id, github_repo_full_name)
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Users can only see their own projects
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own projects
DROP POLICY IF EXISTS "Users can create own projects" ON public.projects;
CREATE POLICY "Users can create own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own projects
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own projects
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;
CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_last_accessed ON public.projects(user_id, last_accessed_at DESC);


-- ============================================
-- PART 3: AI CONVERSATIONS
-- ============================================

-- AI Conversations table - main conversation threads
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  context JSONB DEFAULT '{}',           -- Store file context, repo info, etc.
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

-- Users can only see their own conversations
DROP POLICY IF EXISTS "Users can view own conversations" ON public.ai_conversations;
CREATE POLICY "Users can view own conversations" ON public.ai_conversations
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own conversations
DROP POLICY IF EXISTS "Users can create own conversations" ON public.ai_conversations;
CREATE POLICY "Users can create own conversations" ON public.ai_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own conversations
DROP POLICY IF EXISTS "Users can update own conversations" ON public.ai_conversations;
CREATE POLICY "Users can update own conversations" ON public.ai_conversations
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own conversations
DROP POLICY IF EXISTS "Users can delete own conversations" ON public.ai_conversations;
CREATE POLICY "Users can delete own conversations" ON public.ai_conversations
  FOR DELETE USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_project_id ON public.ai_conversations(project_id);


-- ============================================
-- PART 4: AI MESSAGES
-- ============================================

-- AI Messages table - individual messages in conversations
CREATE TABLE IF NOT EXISTS public.ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',          -- Store file refs, code blocks, etc.
  tokens_used INTEGER,                   -- Optional: track token usage
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

-- Users can see messages from their own conversations
DROP POLICY IF EXISTS "Users can view own messages" ON public.ai_messages;
CREATE POLICY "Users can view own messages" ON public.ai_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ai_conversations 
      WHERE id = ai_messages.conversation_id 
      AND user_id = auth.uid()
    )
  );

-- Users can create messages in their own conversations
DROP POLICY IF EXISTS "Users can create own messages" ON public.ai_messages;
CREATE POLICY "Users can create own messages" ON public.ai_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_conversations 
      WHERE id = ai_messages.conversation_id 
      AND user_id = auth.uid()
    )
  );

-- Users can delete messages from their own conversations
DROP POLICY IF EXISTS "Users can delete own messages" ON public.ai_messages;
CREATE POLICY "Users can delete own messages" ON public.ai_messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.ai_conversations 
      WHERE id = ai_messages.conversation_id 
      AND user_id = auth.uid()
    )
  );

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.ai_messages(conversation_id, created_at);


-- ============================================
-- PART 5: USER PREFERENCES
-- ============================================

-- User Preferences table - editor settings, theme, etc.
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),
  font_size INTEGER DEFAULT 14 CHECK (font_size >= 10 AND font_size <= 32),
  font_family TEXT DEFAULT 'JetBrains Mono',
  tab_size INTEGER DEFAULT 2 CHECK (tab_size >= 1 AND tab_size <= 8),
  word_wrap BOOLEAN DEFAULT FALSE,
  minimap_enabled BOOLEAN DEFAULT TRUE,
  line_numbers BOOLEAN DEFAULT TRUE,
  auto_save BOOLEAN DEFAULT TRUE,
  editor_settings JSONB DEFAULT '{}',    -- Additional Monaco editor settings
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view their own preferences
DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
CREATE POLICY "Users can view own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own preferences
DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;
CREATE POLICY "Users can insert own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
CREATE POLICY "Users can update own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);


-- ============================================
-- PART 6: AUTO-CREATE PROFILE ON SIGNUP
-- ============================================

-- This trigger automatically creates a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, name, avatar_url, github_username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'user_name'  -- GitHub username from OAuth
  );
  
  -- Create default preferences
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================
-- PART 7: UPDATED_AT TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.ai_conversations;
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.ai_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ============================================
-- PART 8: ACTIVITY LOGS (For Recent Activity tab)
-- ============================================

-- Activity Logs table - tracks user actions for the "Recent Activity" tab
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  
  -- Activity details
  action_type TEXT NOT NULL CHECK (action_type IN (
    'file_opened', 'file_saved', 'file_created', 'file_deleted',
    'repo_loaded', 'branch_switched', 'commit_made',
    'ai_chat_started', 'ai_response_received',
    'error_detected', 'build_started', 'build_completed'
  )),
  title TEXT NOT NULL,                    -- e.g., "Opened file", "AI Refactored"
  description TEXT,                        -- e.g., "src/hooks/useStatus.ts"
  metadata JSONB DEFAULT '{}',            -- Extra data (line changes, code snippet, etc.)
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own activity logs
DROP POLICY IF EXISTS "Users can view own activity logs" ON public.activity_logs;
CREATE POLICY "Users can view own activity logs" ON public.activity_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own activity logs
DROP POLICY IF EXISTS "Users can create own activity logs" ON public.activity_logs;
CREATE POLICY "Users can create own activity logs" ON public.activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own activity logs
DROP POLICY IF EXISTS "Users can delete own activity logs" ON public.activity_logs;
CREATE POLICY "Users can delete own activity logs" ON public.activity_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_activity_user_project ON public.activity_logs(user_id, project_id);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON public.activity_logs(user_id, created_at DESC);


-- ============================================
-- PART 9: AI USAGE LOGS (For AI Logs tab)
-- ============================================

-- AI Logs table - tracks AI assistant usage metrics
CREATE TABLE IF NOT EXISTS public.ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.ai_conversations(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  
  -- Request details
  action TEXT NOT NULL,                   -- e.g., "code_generation", "refactor", "explain", "debug"
  model TEXT,                             -- e.g., "gpt-4", "claude-3", "gemini-pro"
  prompt_preview TEXT,                    -- First 100 chars of prompt for display
  
  -- Metrics
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  latency_ms INTEGER,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'error', 'cancelled')),
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own AI logs
DROP POLICY IF EXISTS "Users can view own ai logs" ON public.ai_logs;
CREATE POLICY "Users can view own ai logs" ON public.ai_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own AI logs
DROP POLICY IF EXISTS "Users can create own ai logs" ON public.ai_logs;
CREATE POLICY "Users can create own ai logs" ON public.ai_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own AI logs (for status updates)
DROP POLICY IF EXISTS "Users can update own ai logs" ON public.ai_logs;
CREATE POLICY "Users can update own ai logs" ON public.ai_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_logs_user ON public.ai_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_conversation ON public.ai_logs(conversation_id);


-- ============================================
-- PART 10: STORAGE BUCKET FOR USER AVATARS
-- ============================================

-- Create a storage bucket for user avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Anyone can view avatars (public bucket)
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Policy: Users can upload their own avatar
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can update their own avatar
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own avatar
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);


-- ============================================
-- VERIFY SETUP
-- ============================================
-- After running this script, you should see:
-- 1. 'profiles' table - User profile info
-- 2. 'projects' table - User's GitHub projects
-- 3. 'ai_conversations' table - AI chat threads
-- 4. 'ai_messages' table - Messages in conversations
-- 5. 'user_preferences' table - Editor settings
-- 6. 'activity_logs' table - Recent activity tracking
-- 7. 'ai_logs' table - AI usage metrics
-- 8. 'avatars' bucket in Storage
-- 9. All RLS policies enabled

