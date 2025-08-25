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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      diagnostic_responses: {
        Row: {
          answer_text: string | null
          answer_value: number | null
          category: string
          created_at: string
          diagnostic_id: string
          id: string
          question_key: string
          question_text: string
          weight: number | null
        }
        Insert: {
          answer_text?: string | null
          answer_value?: number | null
          category: string
          created_at?: string
          diagnostic_id: string
          id?: string
          question_key: string
          question_text: string
          weight?: number | null
        }
        Update: {
          answer_text?: string | null
          answer_value?: number | null
          category?: string
          created_at?: string
          diagnostic_id?: string
          id?: string
          question_key?: string
          question_text?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_responses_diagnostic_id_fkey"
            columns: ["diagnostic_id"]
            isOneToOne: false
            referencedRelation: "diagnostics"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostics: {
        Row: {
          action_plan: Json | null
          ai_analysis_summary: string | null
          communication_score: number | null
          completed_at: string | null
          created_at: string
          finance_score: number | null
          fundraising_score: number | null
          governance_score: number | null
          id: string
          impact_score: number | null
          maturity_level: Database["public"]["Enums"]["maturity_level"] | null
          organization_id: string
          overall_score: number | null
          pdf_report_url: string | null
          status: Database["public"]["Enums"]["diagnostic_status"]
          swot_analysis: Json | null
          title: string
          transparency_score: number | null
          updated_at: string
        }
        Insert: {
          action_plan?: Json | null
          ai_analysis_summary?: string | null
          communication_score?: number | null
          completed_at?: string | null
          created_at?: string
          finance_score?: number | null
          fundraising_score?: number | null
          governance_score?: number | null
          id?: string
          impact_score?: number | null
          maturity_level?: Database["public"]["Enums"]["maturity_level"] | null
          organization_id: string
          overall_score?: number | null
          pdf_report_url?: string | null
          status?: Database["public"]["Enums"]["diagnostic_status"]
          swot_analysis?: Json | null
          title?: string
          transparency_score?: number | null
          updated_at?: string
        }
        Update: {
          action_plan?: Json | null
          ai_analysis_summary?: string | null
          communication_score?: number | null
          completed_at?: string | null
          created_at?: string
          finance_score?: number | null
          fundraising_score?: number | null
          governance_score?: number | null
          id?: string
          impact_score?: number | null
          maturity_level?: Database["public"]["Enums"]["maturity_level"] | null
          organization_id?: string
          overall_score?: number | null
          pdf_report_url?: string | null
          status?: Database["public"]["Enums"]["diagnostic_status"]
          swot_analysis?: Json | null
          title?: string
          transparency_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnostics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          city: string | null
          cnpj: string | null
          created_at: string
          description: string | null
          email: string
          employees_count: number | null
          foundation_year: number | null
          id: string
          name: string
          organization_type: Database["public"]["Enums"]["organization_type"]
          phone: string | null
          state: string | null
          updated_at: string
          website: string | null
          whatsapp: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          created_at?: string
          description?: string | null
          email: string
          employees_count?: number | null
          foundation_year?: number | null
          id?: string
          name: string
          organization_type: Database["public"]["Enums"]["organization_type"]
          phone?: string | null
          state?: string | null
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          created_at?: string
          description?: string | null
          email?: string
          employees_count?: number | null
          foundation_year?: number | null
          id?: string
          name?: string
          organization_type?: Database["public"]["Enums"]["organization_type"]
          phone?: string | null
          state?: string | null
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          category: string
          created_at: string
          description: string | null
          download_url: string | null
          file_url: string | null
          id: string
          is_active: boolean | null
          resource_type: string
          tags: string[] | null
          target_weaknesses: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          download_url?: string | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          resource_type: string
          tags?: string[] | null
          target_weaknesses?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          download_url?: string | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          resource_type?: string
          tags?: string[] | null
          target_weaknesses?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      diagnostic_status: "em_andamento" | "concluido" | "cancelado"
      maturity_level: "bronze" | "prata" | "ouro" | "diamante"
      organization_type:
        | "ong"
        | "associacao"
        | "fundacao"
        | "cooperativa"
        | "outra"
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
      diagnostic_status: ["em_andamento", "concluido", "cancelado"],
      maturity_level: ["bronze", "prata", "ouro", "diamante"],
      organization_type: [
        "ong",
        "associacao",
        "fundacao",
        "cooperativa",
        "outra",
      ],
    },
  },
} as const
