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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      abandoned_carts: {
        Row: {
          contact_notes: string | null
          contact_status: string | null
          converted: boolean | null
          converted_at: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_contacted_at: string | null
          last_name: string | null
          phone: string | null
          vehicle_data: Json | null
        }
        Insert: {
          contact_notes?: string | null
          contact_status?: string | null
          converted?: boolean | null
          converted_at?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id?: string
          last_contacted_at?: string | null
          last_name?: string | null
          phone?: string | null
          vehicle_data?: Json | null
        }
        Update: {
          contact_notes?: string | null
          contact_status?: string | null
          converted?: boolean | null
          converted_at?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_contacted_at?: string | null
          last_name?: string | null
          phone?: string | null
          vehicle_data?: Json | null
        }
        Relationships: []
      }
      customer_documents: {
        Row: {
          created_at: string
          file_name: string | null
          file_size: number | null
          file_url: string
          id: string
          mime_type: string | null
          plan_type: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_url: string
          id?: string
          mime_type?: string | null
          plan_type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_url?: string
          id?: string
          mime_type?: string | null
          plan_type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      customer_policies: {
        Row: {
          created_at: string
          customer_id: string | null
          email: string
          end_date: string | null
          id: string
          payment_type: string | null
          plan_type: string
          policy_number: string | null
          start_date: string
          status: string | null
          updated_at: string
          vehicle_data: Json | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          email: string
          end_date?: string | null
          id?: string
          payment_type?: string | null
          plan_type: string
          policy_number?: string | null
          start_date?: string
          status?: string | null
          updated_at?: string
          vehicle_data?: Json | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          email?: string
          end_date?: string | null
          id?: string
          payment_type?: string | null
          plan_type?: string
          policy_number?: string | null
          start_date?: string
          status?: string | null
          updated_at?: string
          vehicle_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_policies_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          phone: string | null
          plan_type: string | null
          signup_date: string
          status: string | null
          updated_at: string
          voluntary_excess: number | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          phone?: string | null
          plan_type?: string | null
          signup_date?: string
          status?: string | null
          updated_at?: string
          voluntary_excess?: number | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          phone?: string | null
          plan_type?: string | null
          signup_date?: string
          status?: string | null
          updated_at?: string
          voluntary_excess?: number | null
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          click_tracked: boolean | null
          clicked_at: string | null
          conversion_tracked: boolean | null
          converted_at: string | null
          email: string
          email_type: string
          id: string
          open_tracked: boolean | null
          opened_at: string | null
          sent_at: string | null
          subject: string | null
          tracking_id: string
        }
        Insert: {
          click_tracked?: boolean | null
          clicked_at?: string | null
          conversion_tracked?: boolean | null
          converted_at?: string | null
          email: string
          email_type: string
          id?: string
          open_tracked?: boolean | null
          opened_at?: string | null
          sent_at?: string | null
          subject?: string | null
          tracking_id: string
        }
        Update: {
          click_tracked?: boolean | null
          clicked_at?: string | null
          conversion_tracked?: boolean | null
          converted_at?: string | null
          email?: string
          email_type?: string
          id?: string
          open_tracked?: boolean | null
          opened_at?: string | null
          sent_at?: string | null
          subject?: string | null
          tracking_id?: string
        }
        Relationships: []
      }
      email_tracking_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          tracking_id: string
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          tracking_id: string
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          tracking_id?: string
        }
        Relationships: []
      }
      newsletter_signups: {
        Row: {
          created_at: string | null
          discount_code: string | null
          email: string
          id: string
        }
        Insert: {
          created_at?: string | null
          discount_code?: string | null
          email: string
          id?: string
        }
        Update: {
          created_at?: string | null
          discount_code?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          customer_id: string | null
          email: string
          id: string
          payment_date: string
          payment_method: string | null
          plan_type: string
          status: string | null
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          customer_id?: string | null
          email: string
          id?: string
          payment_date?: string
          payment_method?: string | null
          plan_type: string
          status?: string | null
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          customer_id?: string | null
          email?: string
          id?: string
          payment_date?: string
          payment_method?: string | null
          plan_type?: string
          status?: string | null
          transaction_id?: string | null
          updated_at?: string
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
      quote_data: {
        Row: {
          created_at: string | null
          customer_email: string
          customer_name: string | null
          id: string
          plan_data: Json | null
          quote_id: string
          vehicle_data: Json
        }
        Insert: {
          created_at?: string | null
          customer_email: string
          customer_name?: string | null
          id?: string
          plan_data?: Json | null
          quote_id: string
          vehicle_data: Json
        }
        Update: {
          created_at?: string | null
          customer_email?: string
          customer_name?: string | null
          id?: string
          plan_data?: Json | null
          quote_id?: string
          vehicle_data?: Json
        }
        Relationships: []
      }
      special_vehicle_plans: {
        Row: {
          coverage: string
          created_at: string
          description: string | null
          features: Json | null
          id: string
          is_active: boolean
          monthly_price: number | null
          name: string
          three_monthly_price: number | null
          three_yearly_price: number | null
          two_yearly_price: number | null
          updated_at: string
          vehicle_type: string | null
        }
        Insert: {
          coverage: string
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean
          monthly_price?: number | null
          name: string
          three_monthly_price?: number | null
          three_yearly_price?: number | null
          two_yearly_price?: number | null
          updated_at?: string
          vehicle_type?: string | null
        }
        Update: {
          coverage?: string
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean
          monthly_price?: number | null
          name?: string
          three_monthly_price?: number | null
          three_yearly_price?: number | null
          two_yearly_price?: number | null
          updated_at?: string
          vehicle_type?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
