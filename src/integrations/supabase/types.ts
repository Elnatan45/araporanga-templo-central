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
      app_config: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      church_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_hero_image: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_hero_image?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_hero_image?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      church_info: {
        Row: {
          church_description: string
          church_name: string
          copyright_text: string
          created_at: string
          email: string
          id: string
          location: string
          phone: string
          updated_at: string
        }
        Insert: {
          church_description?: string
          church_name?: string
          copyright_text?: string
          created_at?: string
          email?: string
          id?: string
          location?: string
          phone?: string
          updated_at?: string
        }
        Update: {
          church_description?: string
          church_name?: string
          copyright_text?: string
          created_at?: string
          email?: string
          id?: string
          location?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      lecture_info: {
        Row: {
          additional_info: string | null
          contact_info: string | null
          created_at: string
          date_time: string | null
          description: string | null
          id: string
          is_active: boolean
          location: string | null
          max_participants: number | null
          price: number | null
          registration_deadline: string | null
          title: string
          updated_at: string
        }
        Insert: {
          additional_info?: string | null
          contact_info?: string | null
          created_at?: string
          date_time?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          max_participants?: number | null
          price?: number | null
          registration_deadline?: string | null
          title?: string
          updated_at?: string
        }
        Update: {
          additional_info?: string | null
          contact_info?: string | null
          created_at?: string
          date_time?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          max_participants?: number | null
          price?: number | null
          registration_deadline?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      lecture_registrations: {
        Row: {
          created_at: string
          husband_cpf: string
          husband_email: string | null
          husband_name: string
          husband_phone: string
          id: string
          updated_at: string
          wife_cpf: string
          wife_email: string | null
          wife_name: string
          wife_phone: string
        }
        Insert: {
          created_at?: string
          husband_cpf: string
          husband_email?: string | null
          husband_name: string
          husband_phone: string
          id?: string
          updated_at?: string
          wife_cpf: string
          wife_email?: string | null
          wife_name: string
          wife_phone: string
        }
        Update: {
          created_at?: string
          husband_cpf?: string
          husband_email?: string | null
          husband_name?: string
          husband_phone?: string
          id?: string
          updated_at?: string
          wife_cpf?: string
          wife_email?: string | null
          wife_name?: string
          wife_phone?: string
        }
        Relationships: []
      }
      members: {
        Row: {
          birth_date: string | null
          civil_status: Database["public"]["Enums"]["civil_status"]
          congregation: Database["public"]["Enums"]["congregation"]
          created_at: string
          full_name: string
          gender: Database["public"]["Enums"]["gender"]
          id: string
          is_baptized: boolean | null
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          civil_status: Database["public"]["Enums"]["civil_status"]
          congregation: Database["public"]["Enums"]["congregation"]
          created_at?: string
          full_name: string
          gender: Database["public"]["Enums"]["gender"]
          id?: string
          is_baptized?: boolean | null
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          civil_status?: Database["public"]["Enums"]["civil_status"]
          congregation?: Database["public"]["Enums"]["congregation"]
          created_at?: string
          full_name?: string
          gender?: Database["public"]["Enums"]["gender"]
          id?: string
          is_baptized?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      pastor_info: {
        Row: {
          created_at: string
          id: string
          image_position: string
          image_url: string | null
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_position?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_position?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          author_id: string | null
          content: string | null
          created_at: string
          id: string
          image_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      service_schedules: {
        Row: {
          created_at: string
          day_of_week: string
          id: string
          is_active: boolean
          leader: string | null
          service_name: string
          service_time: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: string
          id?: string
          is_active?: boolean
          leader?: string | null
          service_name: string
          service_time: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: string
          id?: string
          is_active?: boolean
          leader?: string | null
          service_name?: string
          service_time?: string
          sort_order?: number
          updated_at?: string
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
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      civil_status: "solteiro" | "casado" | "divorciado" | "viuvo"
      congregation:
        | "sede_araporanga"
        | "congregacao_boa_vista"
        | "congregacao_ponta_serra"
        | "congregacao_balsamo"
        | "congregacao_latao_baixo"
        | "congregacao_latao_cima"
      gender: "masculino" | "feminino"
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
      app_role: ["admin", "moderator", "user"],
      civil_status: ["solteiro", "casado", "divorciado", "viuvo"],
      congregation: [
        "sede_araporanga",
        "congregacao_boa_vista",
        "congregacao_ponta_serra",
        "congregacao_balsamo",
        "congregacao_latao_baixo",
        "congregacao_latao_cima",
      ],
      gender: ["masculino", "feminino"],
    },
  },
} as const
