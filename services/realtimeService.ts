import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Subscribe to table row changes for real-time collaboration
 */
export function subscribeToTableRows(
    tableId: string,
    callback: (payload: any) => void
): RealtimeChannel {
    return supabase
        .channel(`table_rows:${tableId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'table_rows',
                filter: `table_id=eq.${tableId}`,
            },
            callback
        )
        .subscribe();
}

/**
 * Subscribe to table metadata changes (column definitions, etc.)
 */
export function subscribeToTables(
    orgId: string,
    callback: (payload: any) => void
): RealtimeChannel {
    return supabase
        .channel(`tables:${orgId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'tables',
                filter: `org_id=eq.${orgId}`,
            },
            callback
        )
        .subscribe();
}

/**
 * Subscribe to organization changes
 */
export function subscribeToOrganization(
    orgId: string,
    callback: (payload: any) => void
): RealtimeChannel {
    return supabase
        .channel(`organization:${orgId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'organizations',
                filter: `id=eq.${orgId}`,
            },
            callback
        )
        .subscribe();
}

/**
 * Unsubscribe from a realtime channel
 */
export async function unsubscribe(channel: RealtimeChannel): Promise<void> {
    await supabase.removeChannel(channel);
}
