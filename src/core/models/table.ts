import { ColumnDefinition } from './column';
import { Row } from './row';

// Table data structure
export interface TableData {
    id: string;
    org_id: string;
    name: string;
    description: string;
    columns: ColumnDefinition[];
    rows: Row[];
    created_at?: string;
    updated_at?: string;
}

// Filter interface
export interface Filter {
    columnId: string;
    operator: 'contains' | 'equals' | 'greater' | 'less';
    value: string;
    scope?: 'all' | 'selected';
}

// Sort interface
export interface SortState {
    columnId: string;
    direction: 'asc' | 'desc';
}
