import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          business_name: string | null
          created_at: string
        }
      }
      products: {
        Row: {
          id: string
          user_id: string
          name: string
          size: string | null
          price: number
          cost: number
          stock: number
          min_stock: number
          created_at: string
        }
      }
      sales: {
        Row: {
          id: string
          user_id: string
          customer_name: string | null
          total_amount: number
          discount: number
          created_at: string
        }
      }
      sale_items: {
        Row: {
          id: string
          sale_id: string
          product_id: string | null
          quantity: number
          price_at_sale: number
          created_at: string
        }
      }
      inventory_ledger: {
        Row: {
          id: string
          user_id: string
          product_id: string | null
          transaction_type: 'ADDITION' | 'SALE' | 'ADJUSTMENT'
          quantity_change: number
          stock_after: number
          related_sale_id: string | null
          created_at: string
        }
      }
      financial_transactions: {
        Row: {
          id: string
          user_id: string
          type: 'INCOME' | 'EXPENSE'
          amount: number
          description: string | null
          related_sale_id: string | null
          created_at: string
        }
      }
    }
  }
}
