export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      cf_users: {
        Row: {
          id: string
          email: string
          password_hash: string | null
          plan: 'starter' | 'pro'
          contracts_used: number
          contracts_limit: number
          stripe_customer_id: string | null
          subscription_status: string | null
          trial_start_date: string | null
          trial_end_date: string | null
          email_confirmed: boolean
          created_at: string
          updated_at: string
        }
        Insert: { id?: string; email: string; password_hash?: string | null; plan?: 'starter' | 'pro'; contracts_used?: number; contracts_limit?: number; stripe_customer_id?: string | null; subscription_status?: string | null; trial_start_date?: string | null; trial_end_date?: string | null; email_confirmed?: boolean; created_at?: string; updated_at?: string }
        Update: { id?: string; email?: string; password_hash?: string | null; plan?: 'starter' | 'pro'; contracts_used?: number; contracts_limit?: number; stripe_customer_id?: string | null; subscription_status?: string | null; trial_start_date?: string | null; trial_end_date?: string | null; email_confirmed?: boolean; created_at?: string; updated_at?: string }
      }
      cf_contracts: {
        Row: {
          id: string
          user_id: string
          contract_type: string
          client_name: string | null
          project_name: string | null
          content: Json | null
          pdf_url: string | null
          status: string
          created_at: string
        }
        Insert: { id?: string; user_id: string; contract_type: string; client_name?: string | null; project_name?: string | null; content?: Json | null; pdf_url?: string | null; status?: string; created_at?: string }
        Update: { id?: string; user_id?: string; contract_type?: string; client_name?: string | null; project_name?: string | null; content?: Json | null; pdf_url?: string | null; status?: string; created_at?: string }
      }
      cf_orders: {
        Row: {
          id: string
          user_id: string
          amount: number
          currency: string
          stripe_payment_id: string | null
          stripe_subscription_id: string | null
          status: string
          period_start: string | null
          period_end: string | null
          created_at: string
        }
        Insert: { id?: string; user_id: string; amount: number; currency?: string; stripe_payment_id?: string | null; stripe_subscription_id?: string | null; status?: string; period_start?: string | null; period_end?: string | null; created_at?: string }
        Update: { id?: string; user_id?: string; amount?: number; currency?: string; stripe_payment_id?: string | null; stripe_subscription_id?: string | null; status?: string; period_start?: string | null; period_end?: string | null; created_at?: string }
      }
    }
  }
}
