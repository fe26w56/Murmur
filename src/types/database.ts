// Type definitions for Supabase tables
// Will be replaced by auto-generated types: pnpm supabase gen types typescript --local

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          monthly_usage_limit_minutes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          monthly_usage_limit_minutes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          monthly_usage_limit_minutes?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      contexts: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          context_type: 'theme_park' | 'museum' | 'theater' | 'other';
          status: 'pending' | 'ready' | 'researching' | 'error';
          source_url: string | null;
          description: string | null;
          glossary: Json;
          keywords: string[];
          metadata: Json;
          template_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          context_type?: 'theme_park' | 'museum' | 'theater' | 'other';
          status?: 'pending' | 'ready' | 'researching' | 'error';
          source_url?: string | null;
          description?: string | null;
          glossary?: Json;
          keywords?: string[];
          metadata?: Json;
          template_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          context_type?: 'theme_park' | 'museum' | 'theater' | 'other';
          status?: 'pending' | 'ready' | 'researching' | 'error';
          source_url?: string | null;
          description?: string | null;
          glossary?: Json;
          keywords?: string[];
          metadata?: Json;
          template_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          context_id: string | null;
          title: string;
          translation_tier: 'lite' | 'standard' | 'premium';
          started_at: string;
          ended_at: string | null;
          duration_seconds: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          context_id?: string | null;
          title: string;
          translation_tier?: 'lite' | 'standard' | 'premium';
          started_at?: string;
          ended_at?: string | null;
          duration_seconds?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          context_id?: string | null;
          title?: string;
          translation_tier?: 'lite' | 'standard' | 'premium';
          started_at?: string;
          ended_at?: string | null;
          duration_seconds?: number | null;
          created_at?: string;
        };
      };
      transcripts: {
        Row: {
          id: string;
          session_id: string;
          sequence_number: number;
          original_text: string;
          translated_text: string;
          timestamp_ms: number;
          translation_tier: 'lite' | 'standard' | 'premium';
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          sequence_number: number;
          original_text: string;
          translated_text: string;
          timestamp_ms: number;
          translation_tier: 'lite' | 'standard' | 'premium';
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          sequence_number?: number;
          original_text?: string;
          translated_text?: string;
          timestamp_ms?: number;
          translation_tier?: 'lite' | 'standard' | 'premium';
          created_at?: string;
        };
      };
      context_templates: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          context_type: 'theme_park' | 'museum' | 'theater' | 'other';
          park_name: string | null;
          glossary: Json;
          keywords: string[];
          metadata: Json;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id: string;
          title: string;
          description?: string | null;
          context_type?: 'theme_park' | 'museum' | 'theater' | 'other';
          park_name?: string | null;
          glossary?: Json;
          keywords?: string[];
          metadata?: Json;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          context_type?: 'theme_park' | 'museum' | 'theater' | 'other';
          park_name?: string | null;
          glossary?: Json;
          keywords?: string[];
          metadata?: Json;
          sort_order?: number;
          created_at?: string;
        };
      };
    };
    Functions: {
      get_monthly_usage: {
        Args: { target_user_id: string };
        Returns: number;
      };
    };
    Enums: {
      context_type: 'theme_park' | 'museum' | 'theater' | 'other';
      context_status: 'pending' | 'ready' | 'researching' | 'error';
      translation_tier: 'lite' | 'standard' | 'premium';
    };
  };
};
