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
          step_abandoned: string | null
          updated_at: string | null
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
          step_abandoned?: string | null
          updated_at?: string | null
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
          step_abandoned?: string | null
          updated_at?: string | null
          vehicle_data?: Json | null
        }
        Relationships: []
      }
      admin_notes: {
        Row: {
          created_at: string
          created_by: string | null
          customer_id: string | null
          id: string
          note: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          id?: string
          note: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          id?: string
          note?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_notes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      blocked_ips: {
        Row: {
          blocked_at: string | null
          created_at: string
          created_by: string | null
          id: string
          ip_address: string
          reason: string | null
        }
        Insert: {
          blocked_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          ip_address: string
          reason?: string | null
        }
        Update: {
          blocked_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          ip_address?: string
          reason?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string | null
          author_id: string | null
          content: string | null
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          author?: string | null
          author_id?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          author?: string | null
          author_id?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: []
      }
      claims_submissions: {
        Row: {
          claim_type: string | null
          created_at: string
          customer_id: string | null
          description: string | null
          email: string | null
          id: string
          name: string | null
          policy_number: string | null
          status: string | null
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          claim_type?: string | null
          created_at?: string
          customer_id?: string | null
          description?: string | null
          email?: string | null
          id?: string
          name?: string | null
          policy_number?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          claim_type?: string | null
          created_at?: string
          customer_id?: string | null
          description?: string | null
          email?: string | null
          id?: string
          name?: string | null
          policy_number?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "claims_submissions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      click_fraud_protection: {
        Row: {
          action_type: string | null
          click_count: number | null
          created_at: string
          id: string
          ip_address: string
          is_suspicious: boolean | null
          risk_score: number | null
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          action_type?: string | null
          click_count?: number | null
          created_at?: string
          id?: string
          ip_address: string
          is_suspicious?: boolean | null
          risk_score?: number | null
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          action_type?: string | null
          click_count?: number | null
          created_at?: string
          id?: string
          ip_address?: string
          is_suspicious?: boolean | null
          risk_score?: number | null
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          phone: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      customer_documents: {
        Row: {
          created_at: string
          document_name: string | null
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
          document_name?: string | null
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
          document_name?: string | null
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
      customer_note_tags: {
        Row: {
          created_at: string
          id: string
          note_id: string | null
          tag_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          note_id?: string | null
          tag_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          note_id?: string | null
          tag_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_note_tags_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "customer_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_note_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "customer_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_notes: {
        Row: {
          created_at: string
          created_by: string | null
          customer_id: string | null
          id: string
          is_pinned: boolean | null
          note_text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          id?: string
          is_pinned?: boolean | null
          note_text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          id?: string
          is_pinned?: boolean | null
          note_text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_notes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_policies: {
        Row: {
          breakdown_cover: boolean | null
          claim_limit: number | null
          created_at: string
          customer_id: string | null
          email: string
          email_sent_status: string | null
          end_date: string | null
          european_cover: boolean | null
          id: string
          is_deleted: boolean | null
          mot_fee: boolean | null
          payment_type: string | null
          plan_type: string
          policy_end_date: string | null
          policy_number: string | null
          policy_start_date: string | null
          rental_car: boolean | null
          seasonal_bonus_months: number | null
          start_date: string
          status: string | null
          transfer_fee: boolean | null
          tyre_cover: boolean | null
          updated_at: string
          vehicle_data: Json | null
          warranties_2000_sent_at: string | null
          warranties_2000_status: string | null
          warranty_number: string | null
          wear_and_tear: boolean | null
        }
        Insert: {
          breakdown_cover?: boolean | null
          claim_limit?: number | null
          created_at?: string
          customer_id?: string | null
          email: string
          email_sent_status?: string | null
          end_date?: string | null
          european_cover?: boolean | null
          id?: string
          is_deleted?: boolean | null
          mot_fee?: boolean | null
          payment_type?: string | null
          plan_type: string
          policy_end_date?: string | null
          policy_number?: string | null
          policy_start_date?: string | null
          rental_car?: boolean | null
          seasonal_bonus_months?: number | null
          start_date?: string
          status?: string | null
          transfer_fee?: boolean | null
          tyre_cover?: boolean | null
          updated_at?: string
          vehicle_data?: Json | null
          warranties_2000_sent_at?: string | null
          warranties_2000_status?: string | null
          warranty_number?: string | null
          wear_and_tear?: boolean | null
        }
        Update: {
          breakdown_cover?: boolean | null
          claim_limit?: number | null
          created_at?: string
          customer_id?: string | null
          email?: string
          email_sent_status?: string | null
          end_date?: string | null
          european_cover?: boolean | null
          id?: string
          is_deleted?: boolean | null
          mot_fee?: boolean | null
          payment_type?: string | null
          plan_type?: string
          policy_end_date?: string | null
          policy_number?: string | null
          policy_start_date?: string | null
          rental_car?: boolean | null
          seasonal_bonus_months?: number | null
          start_date?: string
          status?: string | null
          transfer_fee?: boolean | null
          tyre_cover?: boolean | null
          updated_at?: string
          vehicle_data?: Json | null
          warranties_2000_sent_at?: string | null
          warranties_2000_status?: string | null
          warranty_number?: string | null
          wear_and_tear?: boolean | null
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
      customer_tag_assignments: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          tag_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_tag_assignments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "customer_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_tags: {
        Row: {
          category: string | null
          color: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          color?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          assigned_to: string | null
          created_at: string
          email: string
          id: string
          name: string | null
          payment_type: string | null
          phone: string | null
          plan_type: string | null
          signup_date: string
          status: string | null
          updated_at: string
          voluntary_excess: number | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          email: string
          id?: string
          name?: string | null
          payment_type?: string | null
          phone?: string | null
          plan_type?: string | null
          signup_date?: string
          status?: string | null
          updated_at?: string
          voluntary_excess?: number | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          payment_type?: string | null
          phone?: string | null
          plan_type?: string | null
          signup_date?: string
          status?: string | null
          updated_at?: string
          voluntary_excess?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_codes: {
        Row: {
          code: string
          created_at: string
          current_uses: number | null
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          type: string
          updated_at: string
          value: number
        }
        Insert: {
          code: string
          created_at?: string
          current_uses?: number | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          type: string
          updated_at?: string
          value: number
        }
        Update: {
          code?: string
          created_at?: string
          current_uses?: number | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          type?: string
          updated_at?: string
          value?: number
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
          recipient_email: string | null
          sent_at: string | null
          status: string | null
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
          recipient_email?: string | null
          sent_at?: string | null
          status?: string | null
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
          recipient_email?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          tracking_id?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body: string
          created_at: string
          id: string
          name: string
          subject: string
          template_type: string | null
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          name: string
          subject: string
          template_type?: string | null
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          name?: string
          subject?: string
          template_type?: string | null
          updated_at?: string
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
      monthly_claims_stats: {
        Row: {
          approved_claims: number | null
          created_at: string
          id: string
          month: string
          total_claims: number | null
          total_paid: number | null
          updated_at: string
        }
        Insert: {
          approved_claims?: number | null
          created_at?: string
          id?: string
          month: string
          total_claims?: number | null
          total_paid?: number | null
          updated_at?: string
        }
        Update: {
          approved_claims?: number | null
          created_at?: string
          id?: string
          month?: string
          total_claims?: number | null
          total_paid?: number | null
          updated_at?: string
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
      note_tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
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
      plans: {
        Row: {
          created_at: string
          description: string | null
          duration_months: number
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_months: number
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_months?: number
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
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
      rate_limits: {
        Row: {
          action_type: string
          count: number | null
          created_at: string
          id: string
          identifier: string
          request_count: number | null
          updated_at: string
          window_start: string | null
        }
        Insert: {
          action_type: string
          count?: number | null
          created_at?: string
          id?: string
          identifier: string
          request_count?: number | null
          updated_at?: string
          window_start?: string | null
        }
        Update: {
          action_type?: string
          count?: number | null
          created_at?: string
          id?: string
          identifier?: string
          request_count?: number | null
          updated_at?: string
          window_start?: string | null
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
          yearly_price: number | null
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
          yearly_price?: number | null
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
          yearly_price?: number | null
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
      welcome_emails: {
        Row: {
          created_at: string
          customer_id: string | null
          email: string
          id: string
          sent_at: string | null
          status: string | null
          temporary_password: string | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          email: string
          id?: string
          sent_at?: string | null
          status?: string | null
          temporary_password?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          email?: string
          id?: string
          sent_at?: string | null
          status?: string | null
          temporary_password?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "welcome_emails_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
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
