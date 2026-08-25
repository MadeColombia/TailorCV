export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      ai_usage: {
        Row: {
          completion_tokens: number
          created_at: string
          feature: string
          id: string
          model: string
          prompt_tokens: number
          total_tokens: number
          user_id: string | null
        }
        Insert: {
          completion_tokens?: number
          created_at?: string
          feature?: string
          id?: string
          model?: string
          prompt_tokens?: number
          total_tokens?: number
          user_id?: string | null
        }
        Update: {
          completion_tokens?: number
          created_at?: string
          feature?: string
          id?: string
          model?: string
          prompt_tokens?: number
          total_tokens?: number
          user_id?: string | null
        }
        Relationships: []
      }
      application_messages: {
        Row: {
          application_id: string
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          application_id: string
          content?: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          application_id?: string
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_messages_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          applied_at: string | null
          archived_at: string | null
          company: string
          cover_letter: string
          created_at: string
          id: string
          interview_at: string | null
          interview_prep: Json | null
          language: string
          last_followup_at: string | null
          match_result: Json | null
          next_action_at: string | null
          offer_summary: Json | null
          offer_text: string
          offer_url: string
          outcome_feedback: string
          previous_stage: string
          role_title: string
          salary_expectation: string
          stage: string
          status: string
          tailored_cv: Json | null
          template_overrides: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          archived_at?: string | null
          company?: string
          cover_letter?: string
          created_at?: string
          id?: string
          interview_at?: string | null
          interview_prep?: Json | null
          language?: string
          last_followup_at?: string | null
          match_result?: Json | null
          next_action_at?: string | null
          offer_summary?: Json | null
          offer_text?: string
          offer_url?: string
          outcome_feedback?: string
          previous_stage?: string
          role_title?: string
          salary_expectation?: string
          stage?: string
          status?: string
          tailored_cv?: Json | null
          template_overrides?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_at?: string | null
          archived_at?: string | null
          company?: string
          cover_letter?: string
          created_at?: string
          id?: string
          interview_at?: string | null
          interview_prep?: Json | null
          language?: string
          last_followup_at?: string | null
          match_result?: Json | null
          next_action_at?: string | null
          offer_summary?: Json | null
          offer_text?: string
          offer_url?: string
          outcome_feedback?: string
          previous_stage?: string
          role_title?: string
          salary_expectation?: string
          stage?: string
          status?: string
          tailored_cv?: Json | null
          template_overrides?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      candidate_dossier: {
        Row: {
          content: string
          created_at: string
          updated_at: string
          uploaded_at: string | null
          uploaded_context: string
          uploaded_name: string | null
          user_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          updated_at?: string
          uploaded_at?: string | null
          uploaded_context?: string
          uploaded_name?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          updated_at?: string
          uploaded_at?: string | null
          uploaded_context?: string
          uploaded_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      candidate_knowledge: {
        Row: {
          answer: string
          created_at: string
          id: string
          question: string
          source_application_id: string | null
          user_id: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          question?: string
          source_application_id?: string | null
          user_id: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          question?: string
          source_application_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_knowledge_source_application_id_fkey"
            columns: ["source_application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      cv_templates: {
        Row: {
          settings: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          settings?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          settings?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      feedback_reviews: {
        Row: {
          application_id: string | null
          created_at: string
          id: string
          may_quote: boolean
          message: string
          rating: number
          source: string
          user_id: string
        }
        Insert: {
          application_id?: string | null
          created_at?: string
          id?: string
          may_quote?: boolean
          message?: string
          rating?: number
          source?: string
          user_id: string
        }
        Update: {
          application_id?: string | null
          created_at?: string
          id?: string
          may_quote?: boolean
          message?: string
          rating?: number
          source?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_reviews_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_reports: {
        Row: {
          client_info: Json | null
          created_at: string
          id: string
          message: string
          route: string
          screenshot_path: string | null
          status: string
          user_agent: string
          user_id: string
        }
        Insert: {
          client_info?: Json | null
          created_at?: string
          id?: string
          message?: string
          route?: string
          screenshot_path?: string | null
          status?: string
          user_agent?: string
          user_id: string
        }
        Update: {
          client_info?: Json | null
          created_at?: string
          id?: string
          message?: string
          route?: string
          screenshot_path?: string | null
          status?: string
          user_agent?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          education: Json
          email: string
          experiences: Json
          full_name: string
          headline: string
          language: string
          link_items: Json
          links: string
          location: string
          phone: string
          photo_url: string
          skills: Json
          summary: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          education?: Json
          email?: string
          experiences?: Json
          full_name?: string
          headline?: string
          language?: string
          link_items?: Json
          links?: string
          location?: string
          phone?: string
          photo_url?: string
          skills?: Json
          summary?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          education?: Json
          email?: string
          experiences?: Json
          full_name?: string
          headline?: string
          language?: string
          link_items?: Json
          links?: string
          location?: string
          phone?: string
          photo_url?: string
          skills?: Json
          summary?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      role_targets: {
        Row: {
          created_at: string
          generated_cv: Json | null
          id: string
          industry: string
          keywords: Json
          language: string
          location: string
          match_result: Json | null
          sample_offers: string
          seniority: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          generated_cv?: Json | null
          id?: string
          industry?: string
          keywords?: Json
          language?: string
          location?: string
          match_result?: Json | null
          sample_offers?: string
          seniority?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          generated_cv?: Json | null
          id?: string
          industry?: string
          keywords?: Json
          language?: string
          location?: string
          match_result?: Json | null
          sample_offers?: string
          seniority?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          archive_retention_days: number
          auto_delete_enabled: boolean
          auto_delete_months: number
          cover_letter_tone: string
          created_at: string
          cv_languages: string[]
          deep_prep_on_interview: boolean
          default_app_language: string
          email_context_expiry: boolean
          email_new_features: boolean
          followup_offset_days: number
          ghost_after_days: number
          interview_depth: string
          response_window_days: number
          session_message_cap: number
          ui_language: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archive_retention_days?: number
          auto_delete_enabled?: boolean
          auto_delete_months?: number
          cover_letter_tone?: string
          created_at?: string
          cv_languages?: string[]
          deep_prep_on_interview?: boolean
          default_app_language?: string
          email_context_expiry?: boolean
          email_new_features?: boolean
          followup_offset_days?: number
          ghost_after_days?: number
          interview_depth?: string
          response_window_days?: number
          session_message_cap?: number
          ui_language?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archive_retention_days?: number
          auto_delete_enabled?: boolean
          auto_delete_months?: number
          cover_letter_tone?: string
          created_at?: string
          cv_languages?: string[]
          deep_prep_on_interview?: boolean
          default_app_language?: string
          email_context_expiry?: boolean
          email_new_features?: boolean
          followup_offset_days?: number
          ghost_after_days?: number
          interview_depth?: string
          response_window_days?: number
          session_message_cap?: number
          ui_language?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_master_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
