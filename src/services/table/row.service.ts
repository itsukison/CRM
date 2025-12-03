import { supabase } from '@/adapters/database/supabase.client';
import type { Row } from '@/types';


/**
 * Create a new row with JSONB data
 * @param tableId - The table ID
 * @param data - Object mapping column IDs to values: { col_id_1: value1, col_id_2: value2, ... }
 */
export async function createRow(
    tableId: string,
    data: Record<string, any>
): Promise<{ row: Row | null; error: Error | null }> {
    try {
        const { data: rowData, error } = await supabase
            .from('table_rows')
            .insert({
                table_id: tableId,
                data: data as any,
            })
            .select()
            .single();

        if (error) throw error;

        // Transform JSONB data to Row format
        const row: Row = {
            id: rowData.id,
            ...rowData.data as Record<string, any>,
        };

        return { row, error: null };
    } catch (error) {
        return { row: null, error: error as Error };
    }
}

/**
 * Get all rows for a table
 */
export async function getRows(tableId: string): Promise<{
    rows: Row[];
    error: Error | null;
}> {
    try {
        const { data, error } = await supabase
            .from('table_rows')
            .select('*')
            .eq('table_id', tableId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Transform JSONB data to Row format
        const rows: Row[] = data.map(row => ({
            id: row.id,
            ...row.data as Record<string, any>,
        }));

        return { rows, error: null };
    } catch (error) {
        return { rows: [], error: error as Error };
    }
}

/**
 * Update a row's data
 * @param rowId - The row ID
 * @param data - Object mapping column IDs to new values
 */
export async function updateRow(
    rowId: string,
    data: Record<string, any>
): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase
            .from('table_rows')
            .update({ data: data as any })
            .eq('id', rowId);

        if (error) throw error;
        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}

/**
 * Delete a single row
 */
export async function deleteRow(rowId: string): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase
            .from('table_rows')
            .delete()
            .eq('id', rowId);

        if (error) throw error;
        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}

/**
 * Delete multiple rows
 */
export async function deleteRows(rowIds: string[]): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase
            .from('table_rows')
            .delete()
            .in('id', rowIds);

        if (error) throw error;
        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}

/**
 * Transform Row to JSONB data format (for inserts/updates)
 * Removes the 'id' field and returns the rest as JSONB data
 * Optionally includes all columns from the table definition to ensure all fields are present
 */
export function rowToData(row: Row, columns?: Array<{ id: string }>): Record<string, any> {
    const { id, ...data } = row;
    
    // If columns are provided, ensure all column fields are included in the data
    // This is important for updates where we want to include all fields, even if they're undefined
    if (columns) {
        const result: Record<string, any> = {};
        // First, include all column fields explicitly (this ensures new fields are added)
        columns.forEach(col => {
            const value = row[col.id];
            // Include the field with its value, or null if undefined
            // This ensures that new fields get added to the JSONB data
            result[col.id] = value !== undefined ? value : null;
        });
        // Then merge in any other fields that might exist (for backward compatibility)
        Object.keys(data).forEach(key => {
            // Only add if it's not already in result (columns take precedence)
            if (!(key in result)) {
                result[key] = data[key];
            }
        });
        return result;
    }
    
    return data;
}

/**
 * Transform JSONB data to Row format (for reads)
 */
export function dataToRow(id: string, data: Record<string, any>): Row {
    return {
        id,
        ...data,
    };
}
