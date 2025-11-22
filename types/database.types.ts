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
            org_invitations: {
                Row: {
                    accepted_at: string | null
                    created_at: string | null
                    email: string
                    expires_at: string
                    id: string
                    invited_by: string | null
                    org_id: string | null
                    role: string
                    token: string
                }
                Insert: {
                    accepted_at?: string | null
                    created_at?: string | null
                    email: string
                    expires_at?: string
                    id?: string
                    invited_by?: string | null
                    org_id?: string | null
                    role: string
                    token?: string
                }
                Update: {
                    accepted_at?: string | null
                    created_at?: string | null
                    email?: string
                    expires_at?: string
                    id?: string
                    invited_by?: string | null
                    org_id?: string | null
                    role?: string
                    token?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "org_invitations_org_id_fkey"
                        columns: ["org_id"]
                        isOneToOne: false
                        referencedRelation: "organizations"
                        referencedColumns: ["id"]
                    },
                ]
            }
            org_members: {
                Row: {
                    joined_at: string | null
                    org_id: string
                    role: string
                    user_id: string
                }
                Insert: {
                    joined_at?: string | null
                    org_id: string
                    role: string
                    user_id: string
                }
                Update: {
                    joined_at?: string | null
                    org_id?: string
                    role?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "org_members_org_id_fkey"
                        columns: ["org_id"]
                        isOneToOne: false
                        referencedRelation: "organizations"
                        referencedColumns: ["id"]
                    },
                ]
            }
            organizations: {
                Row: {
                    created_at: string | null
                    description: string | null
                    id: string
                    name: string
                    owner_id: string | null
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    name: string
                    owner_id?: string | null
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    name?: string
                    owner_id?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            table_rows: {
                Row: {
                    created_at: string | null
                    data: Json
                    id: string
                    table_id: string | null
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    data?: Json
                    id?: string
                    table_id?: string | null
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    data?: Json
                    id?: string
                    table_id?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "table_rows_table_id_fkey"
                        columns: ["table_id"]
                        isOneToOne: false
                        referencedRelation: "tables"
                        referencedColumns: ["id"]
                    },
                ]
            }
            tables: {
                Row: {
                    columns: Json
                    created_at: string | null
                    description: string | null
                    id: string
                    name: string
                    org_id: string | null
                    updated_at: string | null
                }
                Insert: {
                    columns?: Json
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    name: string
                    org_id?: string | null
                    updated_at?: string | null
                }
                Update: {
                    columns?: Json
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    name?: string
                    org_id?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "tables_org_id_fkey"
                        columns: ["org_id"]
                        isOneToOne: false
                        referencedRelation: "organizations"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            user_organizations: {
                Args: {
                    user_uuid: string
                }
                Returns: string[]
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

