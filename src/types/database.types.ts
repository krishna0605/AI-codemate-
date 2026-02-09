export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action_type: string;
          created_at: string | null;
          description: string | null;
          id: string;
          metadata: Json | null;
          project_id: string | null;
          title: string;
          user_id: string;
        };
        Insert: {
          action_type: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          metadata?: Json | null;
          project_id?: string | null;
          title: string;
          user_id: string;
        };
        Update: {
          action_type?: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          metadata?: Json | null;
          project_id?: string | null;
          title?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'activity_logs_project_id_fkey';
            columns: ['project_id'];
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'activity_logs_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      ai_conversations: {
        Row: {
          context: Json | null;
          created_at: string | null;
          id: string;
          is_archived: boolean | null;
          project_id: string | null;
          title: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          context?: Json | null;
          created_at?: string | null;
          id?: string;
          is_archived?: boolean | null;
          project_id?: string | null;
          title?: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          context?: Json | null;
          created_at?: string | null;
          id?: string;
          is_archived?: boolean | null;
          project_id?: string | null;
          title?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ai_conversations_project_id_fkey';
            columns: ['project_id'];
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ai_conversations_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      ai_logs: {
        Row: {
          action: string;
          completion_tokens: number | null;
          conversation_id: string | null;
          created_at: string | null;
          error_message: string | null;
          id: string;
          latency_ms: number | null;
          model: string | null;
          project_id: string | null;
          prompt_preview: string | null;
          prompt_tokens: number | null;
          status: string | null;
          total_tokens: number | null;
          user_id: string;
        };
        Insert: {
          action: string;
          completion_tokens?: number | null;
          conversation_id?: string | null;
          created_at?: string | null;
          error_message?: string | null;
          id?: string;
          latency_ms?: number | null;
          model?: string | null;
          project_id?: string | null;
          prompt_preview?: string | null;
          prompt_tokens?: number | null;
          status?: string | null;
          total_tokens?: number | null;
          user_id: string;
        };
        Update: {
          action?: string;
          completion_tokens?: number | null;
          conversation_id?: string | null;
          created_at?: string | null;
          error_message?: string | null;
          id?: string;
          latency_ms?: number | null;
          model?: string | null;
          project_id?: string | null;
          prompt_preview?: string | null;
          prompt_tokens?: number | null;
          status?: string | null;
          total_tokens?: number | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ai_logs_conversation_id_fkey';
            columns: ['conversation_id'];
            referencedRelation: 'ai_conversations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ai_logs_project_id_fkey';
            columns: ['project_id'];
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ai_logs_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      ai_messages: {
        Row: {
          content: string;
          conversation_id: string;
          created_at: string | null;
          id: string;
          metadata: Json | null;
          role: string;
          tokens_used: number | null;
        };
        Insert: {
          content: string;
          conversation_id: string;
          created_at?: string | null;
          id?: string;
          metadata?: Json | null;
          role: string;
          tokens_used?: number | null;
        };
        Update: {
          content?: string;
          conversation_id?: string;
          created_at?: string | null;
          id?: string;
          metadata?: Json | null;
          role?: string;
          tokens_used?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'ai_messages_conversation_id_fkey';
            columns: ['conversation_id'];
            referencedRelation: 'ai_conversations';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          email: string | null;
          github_username: string | null;
          id: string;
          name: string | null;
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          email?: string | null;
          github_username?: string | null;
          id: string;
          name?: string | null;
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          email?: string | null;
          github_username?: string | null;
          id?: string;
          name?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      projects: {
        Row: {
          created_at: string | null;
          default_branch: string | null;
          description: string | null;
          github_repo_full_name: string;
          github_repo_id: string | null;
          id: string;
          is_favorite: boolean | null;
          language: string | null;
          last_accessed_at: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          default_branch?: string | null;
          description?: string | null;
          github_repo_full_name: string;
          github_repo_id?: string | null;
          id?: string;
          is_favorite?: boolean | null;
          language?: string | null;
          last_accessed_at?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          default_branch?: string | null;
          description?: string | null;
          github_repo_full_name?: string;
          github_repo_id?: string | null;
          id?: string;
          is_favorite?: boolean | null;
          language?: string | null;
          last_accessed_at?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'projects_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      user_preferences: {
        Row: {
          auto_save: boolean | null;
          created_at: string | null;
          editor_settings: Json | null;
          font_family: string | null;
          font_size: number | null;
          id: string;
          line_numbers: boolean | null;
          minimap_enabled: boolean | null;
          tab_size: number | null;
          theme: string | null;
          updated_at: string | null;
          user_id: string;
          word_wrap: boolean | null;
        };
        Insert: {
          auto_save?: boolean | null;
          created_at?: string | null;
          editor_settings?: Json | null;
          font_family?: string | null;
          font_size?: number | null;
          id?: string;
          line_numbers?: boolean | null;
          minimap_enabled?: boolean | null;
          tab_size?: number | null;
          theme?: string | null;
          updated_at?: string | null;
          user_id: string;
          word_wrap?: boolean | null;
        };
        Update: {
          auto_save?: boolean | null;
          created_at?: string | null;
          editor_settings?: Json | null;
          font_family?: string | null;
          font_size?: number | null;
          id?: string;
          line_numbers?: boolean | null;
          minimap_enabled?: boolean | null;
          tab_size?: number | null;
          theme?: string | null;
          updated_at?: string | null;
          user_id?: string;
          word_wrap?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_preferences_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
