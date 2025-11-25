import { Row } from '@/core/models/row';
import { ColumnDefinition } from '@/core/models/column';

/**
 * Configuration for which fields to display on status cards
 */
export interface CardConfig {
    showName: boolean;
    showAssigned: boolean;
    showValue: boolean;
    showTimestamp: boolean;
    nameFieldId?: string;      // Column ID for the primary name field
    assignedFieldId?: string;  // Column ID for assigned person/user
    valueFieldId?: string;     // Column ID for numeric value (e.g., ARR, revenue)
}

/**
 * Complete configuration for a status board view
 */
export interface StatusBoardConfig {
    tableId: string;
    statusColumnId: string;
    cardConfig: CardConfig;
}

/**
 * A card representing a single record in the kanban board
 */
export interface StatusCard {
    id: string;                    // Row ID
    statusValue: string;           // Current status value
    data: Row;                     // Full row data
    nameValue?: string;            // Extracted name value
    assignedValue?: string;        // Extracted assigned value
    numericValue?: number;         // Extracted numeric value
    updatedAt?: string;            // Last updated timestamp
}

/**
 * A column in the status board representing one status value
 */
export interface StatusColumn {
    id: string;                    // Status value (used as column identifier)
    title: string;                 // Display name for this status
    cards: StatusCard[];           // Cards in this column
    count: number;                 // Number of cards
}

/**
 * Complete status board data structure
 */
export interface StatusBoardData {
    columns: StatusColumn[];
    totalCards: number;
    tableMetadata: {
        id: string;
        name: string;
        columns: ColumnDefinition[];
    };
}

/**
 * Table metadata for selection dropdown
 */
export interface TableOption {
    id: string;
    name: string;
    description?: string;
}

/**
 * Column option for status column selector
 */
export interface ColumnOption {
    id: string;
    name: string;
    type: string;
}

/**
 * Drag event data
 */
export interface DragEndEvent {
    active: {
        id: string;
        data: {
            current?: {
                sortable?: {
                    containerId: string;
                };
            };
        };
    };
    over: {
        id: string;
        data?: {
            current?: {
                sortable?: {
                    containerId: string;
                };
            };
        };
    } | null;
}

