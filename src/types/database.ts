export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      contexts: {
        Row: {
          id: string;
          user_id: string;
          type: ContextType;
          title: string;
          source_url: string | null;
          researched_data: Json;
          glossary: Json;
          keywords: string[];
          status: ContextStatus;
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type?: ContextType;
          title: string;
          source_url?: string | null;
          researched_data?: Json;
          glossary?: Json;
          keywords?: string[];
          status?: ContextStatus;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: ContextType;
          title?: string;
          source_url?: string | null;
          researched_data?: Json;
          glossary?: Json;
          keywords?: string[];
          status?: ContextStatus;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          context_id: string | null;
          title: string;
          translation_tier: TranslationTier;
          started_at: string | null;
          ended_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          context_id?: string | null;
          title?: string;
          translation_tier?: TranslationTier;
          started_at?: string | null;
          ended_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          context_id?: string | null;
          title?: string;
          translation_tier?: TranslationTier;
          started_at?: string | null;
          ended_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      transcripts: {
        Row: {
          id: string;
          session_id: string;
          original_text: string;
          translated_text: string;
          confidence: number | null;
          timestamp_ms: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          original_text: string;
          translated_text: string;
          confidence?: number | null;
          timestamp_ms: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          original_text?: string;
          translated_text?: string;
          confidence?: number | null;
          timestamp_ms?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      context_templates: {
        Row: {
          id: string;
          type: ContextType;
          park: string;
          title: string;
          description: string | null;
          researched_data: Json;
          glossary: Json;
          keywords: string[];
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          type: ContextType;
          park: string;
          title: string;
          description?: string | null;
          researched_data?: Json;
          glossary?: Json;
          keywords?: string[];
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: ContextType;
          park?: string;
          title?: string;
          description?: string | null;
          researched_data?: Json;
          glossary?: Json;
          keywords?: string[];
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_monthly_usage: {
        Args: {
          user_uuid: string;
          target_month?: string;
        };
        Returns: string;
      };
    };
    Enums: {
      context_type: ContextType;
      context_status: ContextStatus;
      translation_tier: TranslationTier;
    };
  };
};

export type ContextType = "theme_park" | "museum" | "theater" | "other";
export type ContextStatus = "pending" | "researching" | "ready" | "error";
export type TranslationTier = "standard" | "lite" | "premium";

// Convenience types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Context = Database["public"]["Tables"]["contexts"]["Row"];
export type Session = Database["public"]["Tables"]["sessions"]["Row"];
export type Transcript = Database["public"]["Tables"]["transcripts"]["Row"];
export type ContextTemplate =
  Database["public"]["Tables"]["context_templates"]["Row"];

// Glossary entry type
export type GlossaryEntry = {
  en: string;
  ja: string;
  category?: string;
};
