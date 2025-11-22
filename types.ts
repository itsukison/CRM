export type ColumnType = 'text' | 'number' | 'tag' | 'url' | 'email' | 'date';

export type TextOverflowMode = 'wrap' | 'clip' | 'visible';

// Column Definition for JSONB schema (stored in tables.columns)
export interface ColumnDefinition {
  id: string;
  name: string;
  type: ColumnType;
  description?: string;
  required?: boolean;
  order: number;
  textOverflow?: TextOverflowMode;
}

// Legacy Column interface (for backward compatibility with existing components)
export interface Column {
  id: string;
  title: string;
  type: ColumnType;
  description?: string;
  textOverflow?: TextOverflowMode;
}

export interface Row {
  id: string;
  [columnId: string]: any;
}

// Database types
export interface User {
  id: string;
  email: string;
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at: string;
  updated_at?: string;
}

export interface OrgMember {
  org_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joined_at: string;
}

export interface Invitation {
  id: string;
  org_id: string;
  email: string;
  role: string;
  token: string;
  expires_at: string;
  invited_by?: string;
  created_at: string;
  accepted_at?: string;
}

// Helper function to convert ColumnDefinition to legacy Column format
export function definitionToColumn(def: ColumnDefinition): Column {
  return {
    id: def.id,
    title: def.name,
    type: def.type,
    description: def.description,
    textOverflow: def.textOverflow as TextOverflowMode | undefined,
  };
}

// Helper function to convert Column to ColumnDefinition
export function columnToDefinition(col: Column, order: number): ColumnDefinition {
  return {
    id: col.id,
    name: col.title,
    type: col.type,
    required: false,
    order: order,
    description: col.description,
    textOverflow: col.textOverflow,
  };
}

export interface TableData {
  id: string;
  org_id: string;
  name: string;
  description: string;
  columns: ColumnDefinition[]; // Using ColumnDefinition for JSONB schema
  rows: Row[];
  created_at?: string;
  updated_at?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  type?: 'text' | 'action_log';
}

export interface Filter {
  columnId: string;
  operator: 'contains' | 'equals' | 'greater' | 'less';
  value: string;
}

export interface SortState {
  columnId: string;
  direction: 'asc' | 'desc';
}

