export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bids: {
        Row: {
          amount: number | null
          created_at: string
          id: string
          lead_id: string | null
          partner_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          id?: string
          lead_id?: string | null
          partner_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          id?: string
          lead_id?: string | null
          partner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bids_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to_partner_id: string | null
          contacted_at: string | null
          created_at: string
          deal_status: string | null
          description: string | null
          email: string | null
          ends_at: string | null
          First_Name: string | null
          id: string
          interest_type: string | null
          Last_Name: string | null
          lead_score: number | null
          location: string | null
          phone: string | null
          price_minimum: number | null
          status: string | null
        }
        Insert: {
          assigned_to_partner_id?: string | null
          contacted_at?: string | null
          created_at?: string
          deal_status?: string | null
          description?: string | null
          email?: string | null
          ends_at?: string | null
          First_Name?: string | null
          id?: string
          interest_type?: string | null
          Last_Name?: string | null
          lead_score?: number | null
          location?: string | null
          phone?: string | null
          price_minimum?: number | null
          status?: string | null
        }
        Update: {
          assigned_to_partner_id?: string | null
          contacted_at?: string | null
          created_at?: string
          deal_status?: string | null
          description?: string | null
          email?: string | null
          ends_at?: string | null
          First_Name?: string | null
          id?: string
          interest_type?: string | null
          Last_Name?: string | null
          lead_score?: number | null
          location?: string | null
          phone?: string | null
          price_minimum?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Leads_assigned_to_partner_id_fkey"
            columns: ["assigned_to_partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          acl_license_number: string | null
          company_name: string | null
          created_at: string
          credit_balance: number | null
          email: string
          id: string
          phone: string | null
          verified: boolean | null
        }
        Insert: {
          acl_license_number?: string | null
          company_name?: string | null
          created_at?: string
          credit_balance?: number | null
          email?: string
          id?: string
          phone?: string | null
          verified?: boolean | null
        }
        Update: {
          acl_license_number?: string | null
          company_name?: string | null
          created_at?: string
          credit_balance?: number | null
          email?: string
          id?: string
          phone?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number | null
          created_at: string
          id: string
          lead_id: string | null
          partner_id: string
          type: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          id?: string
          lead_id?: string | null
          partner_id: string
          type?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          id?: string
          lead_id?: string | null
          partner_id?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
