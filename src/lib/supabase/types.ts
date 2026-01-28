// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
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
    PostgrestVersion: '14.1'
  }
  public: {
    Tables: {
      ballistic_items: {
        Row: {
          category: string
          created_at: string | null
          expiration_date: string | null
          history: Json | null
          id: string
          identification: string | null
          image: string | null
          manufacturing_date: string | null
          model: string | null
          notes: string | null
          om_id: string | null
          serial_number: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          expiration_date?: string | null
          history?: Json | null
          id?: string
          identification?: string | null
          image?: string | null
          manufacturing_date?: string | null
          model?: string | null
          notes?: string | null
          om_id?: string | null
          serial_number?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          expiration_date?: string | null
          history?: Json | null
          id?: string
          identification?: string | null
          image?: string | null
          manufacturing_date?: string | null
          model?: string | null
          notes?: string | null
          om_id?: string | null
          serial_number?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      equipments: {
        Row: {
          created_at: string | null
          id: string
          image: string | null
          model: string | null
          name: string
          operator: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image?: string | null
          model?: string | null
          name: string
          operator?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image?: string | null
          model?: string | null
          name?: string
          operator?: string | null
          status?: string | null
        }
        Relationships: []
      }
      guias: {
        Row: {
          created_at: string | null
          id: string
          om_id: string | null
          pdf_url: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          om_id?: string | null
          pdf_url?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          om_id?: string | null
          pdf_url?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'guias_om_id_fkey'
            columns: ['om_id']
            isOneToOne: false
            referencedRelation: 'oms'
            referencedColumns: ['id']
          },
        ]
      }
      history: {
        Row: {
          created_at: string | null
          date: string | null
          description: string | null
          id: string
          image: string | null
          location_name: string | null
          material_name: string | null
          material_type: string | null
          quantity: number | null
          street_name: string | null
          type: string | null
          user: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          image?: string | null
          location_name?: string | null
          material_name?: string | null
          material_type?: string | null
          quantity?: number | null
          street_name?: string | null
          type?: string | null
          user?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          image?: string | null
          location_name?: string | null
          material_name?: string | null
          material_type?: string | null
          quantity?: number | null
          street_name?: string | null
          type?: string | null
          user?: string | null
        }
        Relationships: []
      }
      locations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          needs_recount: boolean | null
          street_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          needs_recount?: boolean | null
          street_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          needs_recount?: boolean | null
          street_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'locations_street_id_fkey'
            columns: ['street_id']
            isOneToOne: false
            referencedRelation: 'streets'
            referencedColumns: ['id']
          },
        ]
      }
      materials: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image: string | null
          min_stock: number | null
          name: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image?: string | null
          min_stock?: number | null
          name: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image?: string | null
          min_stock?: number | null
          name?: string
          type?: string | null
        }
        Relationships: []
      }
      oms: {
        Row: {
          created_at: string | null
          id: string
          image: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image?: string | null
          name?: string
        }
        Relationships: []
      }
      pallets: {
        Row: {
          created_at: string | null
          description: string | null
          entry_date: string | null
          id: string
          image: string | null
          location_id: string
          material_id: string | null
          material_name: string | null
          quantity: number | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          entry_date?: string | null
          id?: string
          image?: string | null
          location_id: string
          material_id?: string | null
          material_name?: string | null
          quantity?: number | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          entry_date?: string | null
          id?: string
          image?: string | null
          location_id?: string
          material_id?: string | null
          material_name?: string | null
          quantity?: number | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'pallets_material_id_fkey'
            columns: ['material_id']
            isOneToOne: false
            referencedRelation: 'materials'
            referencedColumns: ['id']
          },
        ]
      }
      settings: {
        Row: {
          created_at: string | null
          high_occupancy_threshold: number | null
          id: string
          low_stock_threshold: number | null
          system_name: string | null
        }
        Insert: {
          created_at?: string | null
          high_occupancy_threshold?: number | null
          id?: string
          low_stock_threshold?: number | null
          system_name?: string | null
        }
        Update: {
          created_at?: string | null
          high_occupancy_threshold?: number | null
          id?: string
          low_stock_threshold?: number | null
          system_name?: string | null
        }
        Relationships: []
      }
      streets: {
        Row: {
          created_at: string | null
          id: string
          name: string
          order: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          order?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          order?: number | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          preferences: Json | null
          role: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          preferences?: Json | null
          role?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          preferences?: Json | null
          role?: string | null
        }
        Relationships: []
      }
      Wesley: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
