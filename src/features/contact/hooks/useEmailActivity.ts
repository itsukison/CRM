import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/adapters/database/supabase.client';
import type { EmailActivity } from '../types';

export function useEmailActivity(orgId: string) {
    const [activities, setActivities] = useState<EmailActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchActivities = useCallback(async () => {
        if (!orgId) return;

        try {
            setLoading(true);
            const { data, error: fetchError } = await supabase
                .from('email_activity')
                .select('*')
                .eq('org_id', orgId)
                .order('sent_at', { ascending: false })
                .limit(100);

            if (fetchError) throw fetchError;

            setActivities(data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching email activity:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch activity');
        } finally {
            setLoading(false);
        }
    }, [orgId]);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    const logActivity = useCallback(
        async (activity: Omit<EmailActivity, 'id' | 'sent_at'>) => {
            const { data, error: insertError } = await supabase
                .from('email_activity')
                .insert({
                    org_id: activity.org_id,
                    user_id: activity.user_id,
                    template_id: activity.template_id,
                    template_name: activity.template_name,
                    recipient_email: activity.recipient_email,
                    subject: activity.subject,
                    status: activity.status,
                    error_message: activity.error_message,
                })
                .select()
                .single();

            if (insertError) throw insertError;

            setActivities((prev) => [data, ...prev]);
            return data;
        },
        []
    );

    return {
        activities,
        loading,
        error,
        logActivity,
        refresh: fetchActivities,
    };
}

