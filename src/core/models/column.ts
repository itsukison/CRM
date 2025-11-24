// Column types and definitions
export type ColumnType = 'text' | 'number' | 'tag' | 'url' | 'email' | 'date';
export type TextOverflowMode = 'wrap' | 'clip' | 'visible' | 'ellipsis';

export const COMPANY_COLUMN_ID = 'company_name';

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
