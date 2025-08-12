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
      abandoned_cart_email_templates: {
        Row: {
          created_at: string | null
          html_content: string
          id: string
          is_active: boolean | null
          name: string
          send_delay_minutes: number | null
          subject: string
          text_content: string | null
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          html_content: string
          id?: string
          is_active?: boolean | null
          name: string
          send_delay_minutes?: number | null
          subject: string
          text_content?: string | null
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          html_content?: string
          id?: string
          is_active?: boolean | null
          name?: string
          send_delay_minutes?: number | null
          subject?: string
          text_content?: string | null
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      abandoned_carts: {
        Row: {
          contact_notes: string | null
          contact_status: string | null
          contacted_by: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          last_contacted_at: string | null
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
          vehicle_type: string | null
          vehicle_year: string | null
        }
        Insert: {
          contact_notes?: string | null
          contact_status?: string | null
          contacted_by?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          last_contacted_at?: string | null
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
          vehicle_type?: string | null
          vehicle_year?: string | null
        }
        Update: {
          contact_notes?: string | null
          contact_status?: string | null
          contacted_by?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          last_contacted_at?: string | null
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
          vehicle_type?: string | null
          vehicle_year?: string | null
        }
        Relationships: []
      }
      admin_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invitation_token: string
          invited_by: string
          permissions: Json
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invitation_token: string
          invited_by: string
          permissions?: Json
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by?: string
          permissions?: Json
          role?: Database["public"]["Enums"]["user_role"]
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
      admin_permissions: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          permission_key: string
          permission_name: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          permission_key: string
          permission_name: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          permission_key?: string
          permission_name?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          is_active: boolean
          last_login: string | null
          last_name: string | null
          permissions: Json
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean
          last_login?: string | null
          last_name?: string | null
          permissions?: Json
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean
          last_login?: string | null
          last_name?: string | null
          permissions?: Json
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
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
          bumper_order_id: string | null
          created_at: string
          customer_full_name: string | null
          customer_id: string | null
          document_type: string | null
          email: string
          email_sent_at: string | null
          email_sent_status: string | null
          id: string
          payment_amount: number | null
          payment_currency: string | null
          payment_type: string
          pdf_basic_url: string | null
          pdf_document_path: string | null
          pdf_gold_url: string | null
          pdf_platinum_url: string | null
          plan_type: string
          policy_end_date: string
          policy_number: string
          policy_start_date: string
          status: string
          stripe_session_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string | null
          warranties_2000_response: Json | null
          warranties_2000_sent_at: string | null
          warranties_2000_status: string | null
          warranty_number: string | null
        }
        Insert: {
          address?: Json | null
          bumper_order_id?: string | null
          created_at?: string
          customer_full_name?: string | null
          customer_id?: string | null
          document_type?: string | null
          email: string
          email_sent_at?: string | null
          email_sent_status?: string | null
          id?: string
          payment_amount?: number | null
          payment_currency?: string | null
          payment_type: string
          pdf_basic_url?: string | null
          pdf_document_path?: string | null
          pdf_gold_url?: string | null
          pdf_platinum_url?: string | null
          plan_type: string
          policy_end_date: string
          policy_number: string
          policy_start_date?: string
          status?: string
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
          warranties_2000_response?: Json | null
          warranties_2000_sent_at?: string | null
          warranties_2000_status?: string | null
          warranty_number?: string | null
        }
        Update: {
          address?: Json | null
          bumper_order_id?: string | null
          created_at?: string
          customer_full_name?: string | null
          customer_id?: string | null
          document_type?: string | null
          email?: string
          email_sent_at?: string | null
          email_sent_status?: string | null
          id?: string
          payment_amount?: number | null
          payment_currency?: string | null
          payment_type?: string
          pdf_basic_url?: string | null
          pdf_document_path?: string | null
          pdf_gold_url?: string | null
          pdf_platinum_url?: string | null
          plan_type?: string
          policy_end_date?: string
          policy_number?: string
          policy_start_date?: string
          status?: string
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
          warranties_2000_response?: Json | null
          warranties_2000_sent_at?: string | null
          warranties_2000_status?: string | null
          warranty_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_customer_policies_customer_id"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          assigned_to: string | null
          building_name: string | null
          building_number: string | null
          bumper_order_id: string | null
          country: string | null
          county: string | null
          created_at: string
          discount_amount: number | null
          discount_code: string | null
          email: string
          final_amount: number | null
          first_name: string | null
          flat_number: string | null
          id: string
          last_name: string | null
          mileage: string | null
          name: string
          original_amount: number | null
          payment_type: string | null
          phone: string | null
          plan_type: string
          postcode: string | null
          registration_plate: string | null
          signup_date: string
          status: string
          street: string | null
          stripe_customer_id: string | null
          stripe_session_id: string | null
          town: string | null
          updated_at: string
          vehicle_fuel_type: string | null
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_transmission: string | null
          vehicle_year: string | null
          voluntary_excess: number | null
          warranty_number: string | null
          warranty_reference_number: string | null
        }
        Insert: {
          assigned_to?: string | null
          building_name?: string | null
          building_number?: string | null
          bumper_order_id?: string | null
          country?: string | null
          county?: string | null
          created_at?: string
          discount_amount?: number | null
          discount_code?: string | null
          email: string
          final_amount?: number | null
          first_name?: string | null
          flat_number?: string | null
          id?: string
          last_name?: string | null
          mileage?: string | null
          name: string
          original_amount?: number | null
          payment_type?: string | null
          phone?: string | null
          plan_type: string
          postcode?: string | null
          registration_plate?: string | null
          signup_date?: string
          status?: string
          street?: string | null
          stripe_customer_id?: string | null
          stripe_session_id?: string | null
          town?: string | null
          updated_at?: string
          vehicle_fuel_type?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_transmission?: string | null
          vehicle_year?: string | null
          voluntary_excess?: number | null
          warranty_number?: string | null
          warranty_reference_number?: string | null
        }
        Update: {
          assigned_to?: string | null
          building_name?: string | null
          building_number?: string | null
          bumper_order_id?: string | null
          country?: string | null
          county?: string | null
          created_at?: string
          discount_amount?: number | null
          discount_code?: string | null
          email?: string
          final_amount?: number | null
          first_name?: string | null
          flat_number?: string | null
          id?: string
          last_name?: string | null
          mileage?: string | null
          name?: string
          original_amount?: number | null
          payment_type?: string | null
          phone?: string | null
          plan_type?: string
          postcode?: string | null
          registration_plate?: string | null
          signup_date?: string
          status?: string
          street?: string | null
          stripe_customer_id?: string | null
          stripe_session_id?: string | null
          town?: string | null
          updated_at?: string
          vehicle_fuel_type?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_transmission?: string | null
          vehicle_year?: string | null
          voluntary_excess?: number | null
          warranty_number?: string | null
          warranty_reference_number?: string | null
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
      discount_code_usage: {
        Row: {
          customer_email: string
          discount_amount: number
          discount_code_id: string
          id: string
          order_amount: number
          stripe_session_id: string | null
          used_at: string
        }
        Insert: {
          customer_email: string
          discount_amount: number
          discount_code_id: string
          id?: string
          order_amount: number
          stripe_session_id?: string | null
          used_at?: string
        }
        Update: {
          customer_email?: string
          discount_amount?: number
          discount_code_id?: string
          id?: string
          order_amount?: number
          stripe_session_id?: string | null
          used_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "discount_code_usage_discount_code_id_fkey"
            columns: ["discount_code_id"]
            isOneToOne: false
            referencedRelation: "discount_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_codes: {
        Row: {
          active: boolean
          applicable_products: Json
          code: string
          created_at: string
          created_by: string | null
          id: string
          stripe_coupon_id: string | null
          stripe_promo_code_id: string | null
          type: string
          updated_at: string
          usage_limit: number | null
          used_count: number
          valid_from: string
          valid_to: string
          value: number
        }
        Insert: {
          active?: boolean
          applicable_products?: Json
          code: string
          created_at?: string
          created_by?: string | null
          id?: string
          stripe_coupon_id?: string | null
          stripe_promo_code_id?: string | null
          type: string
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
          valid_from?: string
          valid_to: string
          value: number
        }
        Update: {
          active?: boolean
          applicable_products?: Json
          code?: string
          created_at?: string
          created_by?: string | null
          id?: string
          stripe_coupon_id?: string | null
          stripe_promo_code_id?: string | null
          type?: string
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
          valid_from?: string
          valid_to?: string
          value?: number
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
      plan_document_mapping: {
        Row: {
          created_at: string
          document_path: string
          id: string
          plan_name: string
          updated_at: string
          vehicle_type: string
        }
        Insert: {
          created_at?: string
          document_path: string
          id?: string
          plan_name: string
          updated_at?: string
          vehicle_type: string
        }
        Update: {
          created_at?: string
          document_path?: string
          id?: string
          plan_name?: string
          updated_at?: string
          vehicle_type?: string
        }
        Relationships: []
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
      sales_targets: {
        Row: {
          achieved_amount: number
          admin_user_id: string
          created_at: string
          end_date: string
          id: string
          start_date: string
          target_amount: number
          target_period: string
          updated_at: string
        }
        Insert: {
          achieved_amount?: number
          admin_user_id: string
          created_at?: string
          end_date: string
          id?: string
          start_date: string
          target_amount: number
          target_period: string
          updated_at?: string
        }
        Update: {
          achieved_amount?: number
          admin_user_id?: string
          created_at?: string
          end_date?: string
          id?: string
          start_date?: string
          target_amount?: number
          target_period?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_targets_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
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
      triggered_emails_log: {
        Row: {
          created_at: string | null
          email: string
          email_status: string | null
          id: string
          sent_at: string | null
          template_id: string | null
          trigger_type: string
          vehicle_reg: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          email_status?: string | null
          id?: string
          sent_at?: string | null
          template_id?: string | null
          trigger_type: string
          vehicle_reg?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          email_status?: string | null
          id?: string
          sent_at?: string | null
          template_id?: string | null
          trigger_type?: string
          vehicle_reg?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "triggered_emails_log_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "abandoned_cart_email_templates"
            referencedColumns: ["id"]
          },
        ]
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
      warranty_audit_log: {
        Row: {
          created_by: string | null
          customer_id: string | null
          event_data: Json | null
          event_timestamp: string
          event_type: string
          id: string
          policy_id: string | null
        }
        Insert: {
          created_by?: string | null
          customer_id?: string | null
          event_data?: Json | null
          event_timestamp?: string
          event_type: string
          id?: string
          policy_id?: string | null
        }
        Update: {
          created_by?: string | null
          customer_id?: string | null
          event_data?: Json | null
          event_timestamp?: string
          event_type?: string
          id?: string
          policy_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "warranty_audit_log_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warranty_audit_log_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "customer_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      warranty_serials: {
        Row: {
          id: number
          last_serial: number
          updated_at: string | null
        }
        Insert: {
          id?: number
          last_serial?: number
          updated_at?: string | null
        }
        Update: {
          id?: number
          last_serial?: number
          updated_at?: string | null
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
      generate_random_password: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_warranty_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_next_warranty_serial: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      has_admin_permission: {
        Args: { user_id: string; permission_key: string }
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      log_warranty_event: {
        Args: {
          p_policy_id: string
          p_customer_id: string
          p_event_type: string
          p_event_data?: Json
          p_created_by?: string
        }
        Returns: string
      }
      make_user_admin: {
        Args: { user_email: string }
        Returns: undefined
      }
    }
    Enums: {
      user_role: "admin" | "customer" | "member" | "viewer" | "guest"
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
      user_role: ["admin", "customer", "member", "viewer", "guest"],
    },
  },
} as const
