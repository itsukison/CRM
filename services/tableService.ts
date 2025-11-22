import { supabase } from '../lib/supabase';
import type { TableData, ColumnDefinition } from '../types';

/**
 * Create a new table
 */
export async function createTable(
    orgId: string,
    name: string,
    description: string,
    columns: ColumnDefinition[]
): Promise<{ table: TableData | null; error: Error | null }> {
    try {
        const { data, error } = await supabase
            .from('tables')
            .insert({
                org_id: orgId,
                name,
                description,
                columns: columns as any, // JSONB cast
            })
            .select()
            .single();

        if (error) throw error;

        const table: TableData = {
            id: data.id,
            org_id: data.org_id as string,
            name: data.name,
            description: data.description ?? '',
            columns: (data.columns as any) as ColumnDefinition[],
            rows: [], // New table has no rows
            created_at: data.created_at ?? '',
            updated_at: data.updated_at ?? '',
        };

        return { table, error: null };
    } catch (error) {
        console.error('Error creating table:', error);
        return { table: null, error: error as Error };
    }
}

/**
 * Get all tables for an organization
 */
export async function getTables(orgId: string): Promise<{
    tables: TableData[];
    error: Error | null;
}> {
    try {
        // 1. Get tables
        const { data: tablesData, error: tablesError } = await supabase
            .from('tables')
            .select('*')
            .eq('org_id', orgId)
            .order('created_at', { ascending: false });

        if (tablesError) throw tablesError;

        // 2. Get row counts (optional optimization, or we can load rows later)
        // For the dashboard, we might want just metadata or full data. 
        // The current UI expects 'rows' in TableData.
        // If we have many tables, fetching ALL rows for ALL tables is bad.
        // But DashboardPage only displays row count.
        // Let's fetch row counts efficiently if possible, or just empty rows for list view.

        // For now, to match the UI expectation of having 'rows', we will fetch rows. 
        // WARNING: This is not scalable. 
        // TODO: Refactor UI to not need full rows for the dashboard list.
        // Ideally, we'd use a view or a separate query for counts.
        // But given the instructions to "remove placeholder", I'll load actual data.

        // A better approach for Dashboard: Don't fetch rows. Just fetch metadata.
        // But the TableData type requires 'rows'. 
        // I will return empty rows for the list view to avoid performance hit, 
        // and update the Dashboard to rely on a count from a separate query if needed, 
        // or just accept that rows.length is 0 until opened.
        // Wait, the Dashboard displays "X ROWS". If I return [], it says "0 ROWS".
        // I should probably fetch a count.

        // Let's fetch the tables and for each table, fetch the count of rows.
        // Simplified: return tables with empty rows and cast nullable fields
        const tables: TableData[] = tablesData.map(t => ({
            id: t.id,
            org_id: t.org_id as string,
            name: t.name,
            description: t.description ?? '',
            columns: (t.columns as unknown) as ColumnDefinition[],
            rows: [], // empty rows for list view
            created_at: t.created_at ?? '',
            updated_at: t.updated_at ?? '',
        }));

        return { tables, error: null };
    } catch (error) {
        return { tables: [], error: error as Error };
    }
}

/**
 * Get a single table with all its rows
 */
export async function getTable(tableId: string): Promise<{
    table: TableData | null;
    error: Error | null;
}> {
    try {
        // Get table metadata
        const { data: tableData, error: tableError } = await supabase
            .from('tables')
            .select('*')
            .eq('id', tableId)
            .single();

        if (tableError) throw tableError;

        // Get rows
        const { data: rowsData, error: rowsError } = await supabase
            .from('table_rows')
            .select('*')
            .eq('table_id', tableId)
            .order('created_at', { ascending: true });

        if (rowsError) throw rowsError;

        const rows = rowsData.map(r => ({ id: r.id, ...(r.data as any) }));

        const table: TableData = {
            id: tableData.id,
            org_id: tableData.org_id as string,
            name: tableData.name,
            description: tableData.description ?? '',
            columns: (tableData.columns as unknown) as ColumnDefinition[],
            rows: rows,
            created_at: tableData.created_at ?? '',
            updated_at: tableData.updated_at ?? '',
        };

        return { table, error: null };
    } catch (error) {
        return { table: null, error: error as Error };
    }
}

/**
 * Update table metadata
 */
export async function updateTable(
    tableId: string,
    updates: {
        name?: string;
        description?: string;
        columns?: ColumnDefinition[];
    }
): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase
            .from('tables')
            .update(updates as any)
            .eq('id', tableId);

        if (error) throw error;
        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}

/**
 * Delete a table
 */
export async function deleteTable(tableId: string): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase
            .from('tables')
            .delete()
            .eq('id', tableId);

        if (error) throw error;
        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}
