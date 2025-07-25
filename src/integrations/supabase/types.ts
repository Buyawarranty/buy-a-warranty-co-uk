export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      abandoned_carts: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          mileage: string | null
          payment_type: string | null
          phone: string | null
          plan_id: string | null
          plan_name: string | null
          step_abandoned: number
          updated_at: string
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_reg: string | null
          vehicle_year: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          mileage?: string | null
          payment_type?: string | null
          phone?: string | null
          plan_id?: string | null
          plan_name?: string | null
          step_abandoned: number
          updated_at?: string
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_reg?: string | null
          vehicle_year?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          mileage?: string | null
          payment_type?: string | null
          phone?: string | null
          plan_id?: string | null
          plan_name?: string | null
          step_abandoned?: number
          updated_at?: string
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_reg?: string | null
          vehicle_year?: string | null
        }
        Relationships: []
      }
      admin_notes: {
        Row: {
          created_at: string
          created_by: string | null
          customer_id: string
          id: string
          note: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_id: string
          id?: string
          note: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_id?: string
          id?: string
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_notes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_documents: {
        Row: {
          created_at: string
          document_name: string
          file_size: number | null
          file_url: string
          id: string
          plan_type: string
          updated_at: string
          uploaded_by: string | null
          vehicle_type: string | null
        }
        Insert: {
          created_at?: string
          document_name: string
          file_size?: number | null
          file_url: string
          id?: string
          plan_type: string
          updated_at?: string
          uploaded_by?: string | null
          vehicle_type?: string | null
        }
        Update: {
          created_at?: string
          document_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          plan_type?: string
          updated_at?: string
          uploaded_by?: string | null
          vehicle_type?: string | null
        }
        Relationships: []
      }
      customer_policies: {
        Row: {
          address: Json | null
          created_at: string
          email: string
          id: string
          payment_type: string
          pdf_basic_url: string | null
          pdf_gold_url: string | null
          pdf_platinum_url: string | null
          plan_type: string
          policy_end_date: string
          policy_number: string
          policy_start_date: string
          status: string
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: Json | null
          created_at?: string
          email: string
          id?: string
          payment_type: string
          pdf_basic_url?: string | null
          pdf_gold_url?: string | null
          pdf_platinum_url?: string | null
          plan_type: string
          policy_end_date: string
          policy_number: string
          policy_start_date?: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: Json | null
          created_at?: string
          email?: string
          id?: string
          payment_type?: string
          pdf_basic_url?: string | null
          pdf_gold_url?: string | null
          pdf_platinum_url?: string | null
          plan_type?: string
          policy_end_date?: string
          policy_number?: string
          policy_start_date?: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          plan_type: string
          registration_plate: string | null
          signup_date: string
          status: string
          stripe_customer_id: string | null
          updated_at: string
          voluntary_excess: number | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          plan_type: string
          registration_plate?: string | null
          signup_date?: string
          status?: string
          stripe_customer_id?: string | null
          updated_at?: string
          voluntary_excess?: number | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          plan_type?: string
          registration_plate?: string | null
          signup_date?: string
          status?: string
          stripe_customer_id?: string | null
          updated_at?: string
          voluntary_excess?: number | null
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          created_at: string
          customer_id: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          recipient_email: string
          sent_at: string | null
          status: string
          subject: string
          template_id: string | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          recipient_email: string
          sent_at?: string | null
          status?: string
          subject: string
          template_id?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          recipient_email?: string
          sent_at?: string | null
          status?: string
          subject?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          content: Json
          created_at: string
          created_by: string | null
          from_email: string
          id: string
          is_active: boolean
          name: string
          subject: string
          template_type: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          created_by?: string | null
          from_email?: string
          id?: string
          is_active?: boolean
          name: string
          subject: string
          template_type: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          created_by?: string | null
          from_email?: string
          id?: string
          is_active?: boolean
          name?: string
          subject?: string
          template_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          customer_id: string
          id: string
          payment_date: string
          plan_type: string
          stripe_payment_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          customer_id: string
          id?: string
          payment_date?: string
          plan_type: string
          stripe_payment_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          customer_id?: string
          id?: string
          payment_date?: string
          plan_type?: string
          stripe_payment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          add_ons: Json
          coverage: Json
          created_at: string
          id: string
          is_active: boolean
          monthly_price: number
          name: string
          pricing_matrix: Json | null
          three_yearly_price: number | null
          two_yearly_price: number | null
          updated_at: string
          yearly_price: number | null
        }
        Insert: {
          add_ons?: Json
          coverage?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          monthly_price: number
          name: string
          pricing_matrix?: Json | null
          three_yearly_price?: number | null
          two_yearly_price?: number | null
          updated_at?: string
          yearly_price?: number | null
        }
        Update: {
          add_ons?: Json
          coverage?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          monthly_price?: number
          name?: string
          pricing_matrix?: Json | null
          three_yearly_price?: number | null
          two_yearly_price?: number | null
          updated_at?: string
          yearly_price?: number | null
        }
        Relationships: []
      }
      scheduled_emails: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          metadata: Json | null
          recipient_email: string
          scheduled_for: string
          status: string
          template_id: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          metadata?: Json | null
          recipient_email: string
          scheduled_for: string
          status?: string
          template_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          metadata?: Json | null
          recipient_email?: string
          scheduled_for?: string
          status?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_emails_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_emails_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      special_vehicle_plans: {
        Row: {
          coverage: Json
          created_at: string
          id: string
          is_active: boolean
          monthly_price: number
          name: string
          pricing_matrix: Json | null
          three_yearly_price: number | null
          two_yearly_price: number | null
          updated_at: string
          vehicle_type: string
          yearly_price: number | null
        }
        Insert: {
          coverage?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          monthly_price: number
          name: string
          pricing_matrix?: Json | null
          three_yearly_price?: number | null
          two_yearly_price?: number | null
          updated_at?: string
          vehicle_type: string
          yearly_price?: number | null
        }
        Update: {
          coverage?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          monthly_price?: number
          name?: string
          pricing_matrix?: Json | null
          three_yearly_price?: number | null
          two_yearly_price?: number | null
          updated_at?: string
          vehicle_type?: string
          yearly_price?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      welcome_emails: {
        Row: {
          created_at: string
          email: string
          email_sent_at: string
          id: string
          password_reset: boolean
          policy_id: string | null
          temporary_password: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          email_sent_at?: string
          id?: string
          password_reset?: boolean
          policy_id?: string | null
          temporary_password: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          email_sent_at?: string
          id?: string
          password_reset?: boolean
          policy_id?: string | null
          temporary_password?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "welcome_emails_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "customer_policies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_policy_end_date: {
        Args: { payment_type: string; start_date: string }
        Returns: string
      }
      generate_policy_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "admin" | "customer"
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
      user_role: ["admin", "customer"],
    },
  },
} as const
