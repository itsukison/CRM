import { supabase } from '@/adapters/database/supabase.client';
import { getTable, getTables } from '@/services/tableService';
import { updateRow } from '@/services/rowService';
import type {
    StatusBoardConfig,
    StatusBoardData,
    StatusColumn,
    StatusCard,
    TableOption,
    ColumnOption,
    CardConfig,
} from '../types';
import type { TableData } from '@/core/models/table';
import type { ColumnDefinition } from '@/core/models/column';

const CONFIG_KEY_PREFIX = 'statusTracking_';

/**
 * Load user configuration from localStorage
 */
export function loadUserConfig(orgId: string, tableId?: string): StatusBoardConfig | null {
    try {
        const key = tableId ? `${CONFIG_KEY_PREFIX}${orgId}_${tableId}` : `${CONFIG_KEY_PREFIX}${orgId}_last`;
        const stored = localStorage.getItem(key);
        if (!stored) return null;
        return JSON.parse(stored) as StatusBoardConfig;
    } catch (error) {
        console.error('Failed to load user config:', error);
        return null;
    }
}

/**
 * Save user configuration to localStorage
 */
export function saveUserConfig(orgId: string, config: StatusBoardConfig): void {
    try {
        const key = `${CONFIG_KEY_PREFIX}${orgId}_${config.tableId}`;
        localStorage.setItem(key, JSON.stringify(config));
        // Also save as "last viewed"
        localStorage.setItem(`${CONFIG_KEY_PREFIX}${orgId}_last`, JSON.stringify(config));
    } catch (error) {
        console.error('Failed to save user config:', error);
    }
}

/**
 * Clear user configuration
 */
export function clearUserConfig(orgId: string, tableId?: string): void {
    try {
        if (tableId) {
            const key = `${CONFIG_KEY_PREFIX}${orgId}_${tableId}`;
            localStorage.removeItem(key);
        } else {
            // Clear all configs for this org
            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith(`${CONFIG_KEY_PREFIX}${orgId}`)) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
        }
    } catch (error) {
        console.error('Failed to clear user config:', error);
    }
}

/**
 * Get all tables for selection dropdown
 */
export async function getTableOptions(orgId: string): Promise<TableOption[]> {
    try {
        const { tables, error } = await getTables(orgId);
        if (error) throw error;
        
        return tables.map(table => ({
            id: table.id,
            name: table.name,
            description: table.description,
        }));
    } catch (error) {
        console.error('Failed to get table options:', error);
        return [];
    }
}

/**
 * Get columns suitable for status grouping (text or tag types)
 */
export function getStatusColumnOptions(table: TableData): ColumnOption[] {
    return table.columns
        .filter(col => col.type === 'text' || col.type === 'tag')
        .map(col => ({
            id: col.id,
            name: col.name,
            type: col.type,
        }));
}

/**
 * Auto-detect card field configuration based on column types
 */
export function autoDetectCardFields(columns: ColumnDefinition[]): CardConfig {
    let nameFieldId: string | undefined;
    let assignedFieldId: string | undefined;
    let valueFieldId: string | undefined;

    // Find first text column for name
    const textCol = columns.find(col => col.type === 'text');
    if (textCol) nameFieldId = textCol.id;

    // Find first tag column for assigned (could be person/status)
    const tagCol = columns.find(col => col.type === 'tag' && col.id !== nameFieldId);
    if (tagCol) assignedFieldId = tagCol.id;

    // Find first number column for value
    const numberCol = columns.find(col => col.type === 'number');
    if (numberCol) valueFieldId = numberCol.id;

    return {
        showName: !!nameFieldId,
        showAssigned: !!assignedFieldId,
        showValue: !!valueFieldId,
        showTimestamp: true,
        nameFieldId,
        assignedFieldId,
        valueFieldId,
    };
}

/**
 * Transform row data into a StatusCard
 */
function transformRowToCard(
    row: any,
    statusColumnId: string,
    cardConfig: CardConfig,
    updatedAt?: string
): StatusCard {
    const statusValue = row[statusColumnId] || 'Uncategorized';
    
    return {
        id: row.id,
        statusValue: String(statusValue),
        data: row,
        nameValue: cardConfig.nameFieldId ? row[cardConfig.nameFieldId] : undefined,
        assignedValue: cardConfig.assignedFieldId ? row[cardConfig.assignedFieldId] : undefined,
        numericValue: cardConfig.valueFieldId ? Number(row[cardConfig.valueFieldId]) : undefined,
        updatedAt,
    };
}

/**
 * Fetch and transform table data into status board format
 */
export async function getStatusBoardData(
    tableId: string,
    statusColumnId: string,
    cardConfig: CardConfig
): Promise<{ data: StatusBoardData | null; error: Error | null }> {
    try {
        const { table, error } = await getTable(tableId);
        if (error) throw error;
        if (!table) throw new Error('Table not found');

        // Verify status column exists
        const statusColumn = table.columns.find(col => col.id === statusColumnId);
        if (!statusColumn) {
            throw new Error('Status column not found in table');
        }

        // Group rows by status value
        const columnsMap = new Map<string, StatusCard[]>();
        
        table.rows.forEach(row => {
            // Filter out rows with empty status value
            const rawStatusValue = row[statusColumnId];
            if (rawStatusValue === undefined || rawStatusValue === null || rawStatusValue === '') {
                return;
            }

            const card = transformRowToCard(row, statusColumnId, cardConfig, table.updated_at);
            const statusValue = card.statusValue;
            
            if (!columnsMap.has(statusValue)) {
                columnsMap.set(statusValue, []);
            }
            columnsMap.get(statusValue)!.push(card);
        });

        // Transform map into array of StatusColumn objects
        const columns: StatusColumn[] = Array.from(columnsMap.entries()).map(([statusValue, cards]) => ({
            id: statusValue,
            title: statusValue,
            cards,
            count: cards.length,
        }));

        // Sort columns by title for consistent display
        columns.sort((a, b) => a.title.localeCompare(b.title));

        const boardData: StatusBoardData = {
            columns,
            totalCards: table.rows.length,
            tableMetadata: {
                id: table.id,
                name: table.name,
                columns: table.columns,
            },
        };

        return { data: boardData, error: null };
    } catch (error) {
        console.error('Failed to get status board data:', error);
        return { data: null, error: error as Error };
    }
}

/**
 * Update a card's status (moves it to a different column)
 */
export async function updateCardStatus(
    cardId: string,
    statusColumnId: string,
    newStatusValue: string,
    currentData: any
): Promise<{ error: Error | null }> {
    try {
        // Create updated row data with new status
        const updatedData = {
            ...currentData,
            [statusColumnId]: newStatusValue,
        };

        const { error } = await updateRow(cardId, updatedData);
        if (error) throw error;

        return { error: null };
    } catch (error) {
        console.error('Failed to update card status:', error);
        return { error: error as Error };
    }
}

/**
 * Get table metadata using Supabase client
 */
export async function getTableMetadata(tableId: string): Promise<{
    table: TableData | null;
    error: Error | null;
}> {
    try {
        const { table, error } = await getTable(tableId);
        if (error) throw error;
        return { table, error: null };
    } catch (error) {
        console.error('Failed to get table metadata:', error);
        return { table: null, error: error as Error };
    }
}

/**
 * Debounce helper for localStorage writes
 */
let saveConfigTimeout: NodeJS.Timeout | null = null;

export function debouncedSaveUserConfig(
    orgId: string,
    config: StatusBoardConfig,
    delay: number = 300
): void {
    if (saveConfigTimeout) {
        clearTimeout(saveConfigTimeout);
    }
    saveConfigTimeout = setTimeout(() => {
        saveUserConfig(orgId, config);
    }, delay);
}

