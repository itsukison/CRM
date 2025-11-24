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
 */
export function rowToData(row: Row): Record<string, any> {
    const { id, ...data } = row;
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
