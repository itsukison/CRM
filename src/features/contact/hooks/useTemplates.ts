import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/adapters/database/supabase.client';
import type { EmailTemplate, EmailTemplateInput } from '../types';

export function useTemplates(orgId: string) {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTemplates = useCallback(async () => {
        if (!orgId) return;

        try {
            setLoading(true);
            const { data, error: fetchError } = await supabase
                .from('email_templates')
                .select('*')
                .eq('org_id', orgId)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            // Parse variables from JSON
            const parsedTemplates: EmailTemplate[] = (data || []).map((t) => ({
                ...t,
                variables: Array.isArray(t.variables)
                    ? t.variables.filter(v => v !== null && v !== undefined).map(v => String(v))
                    : [],
            }));

            setTemplates(parsedTemplates);
            setError(null);
        } catch (err) {
            console.error('Error fetching templates:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch templates');
        } finally {
            setLoading(false);
        }
    }, [orgId]);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    const createTemplate = useCallback(
        async (input: EmailTemplateInput) => {
            if (!orgId) throw new Error('No organization selected');

            const { data, error: createError } = await supabase
                .from('email_templates')
                .insert({
                    org_id: orgId,
                    name: input.name,
                    subject: input.subject,
                    body: input.body,
                    variables: input.variables || [],
                })
                .select()
                .single();

            if (createError) throw createError;

            const newTemplate: EmailTemplate = {
                ...data,
                variables: Array.isArray(data.variables)
                    ? data.variables.filter(v => v !== null && v !== undefined).map(v => String(v))
                    : [],
            };

            setTemplates((prev) => [newTemplate, ...prev]);
            return newTemplate;
        },
        [orgId]
    );

    const updateTemplate = useCallback(
        async (id: string, input: Partial<EmailTemplateInput>) => {
            const updateData: Record<string, unknown> = {
                updated_at: new Date().toISOString(),
            };

            if (input.name !== undefined) updateData.name = input.name;
            if (input.subject !== undefined) updateData.subject = input.subject;
            if (input.body !== undefined) updateData.body = input.body;
            if (input.variables !== undefined) updateData.variables = input.variables;

            const { data, error: updateError } = await supabase
                .from('email_templates')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (updateError) throw updateError;

            const updatedTemplate: EmailTemplate = {
                ...data,
                variables: Array.isArray(data.variables)
                    ? data.variables.filter(v => v !== null && v !== undefined).map(v => String(v))
                    : [],
            };

            setTemplates((prev) =>
                prev.map((t) => (t.id === id ? updatedTemplate : t))
            );

            return updatedTemplate;
        },
        []
    );

    const deleteTemplate = useCallback(async (id: string) => {
        const { error: deleteError } = await supabase
            .from('email_templates')
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;

        setTemplates((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const getTemplate = useCallback(
        (id: string) => templates.find((t) => t.id === id),
        [templates]
    );

    return {
        templates,
        loading,
        error,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        getTemplate,
        refresh: fetchTemplates,
    };
}

