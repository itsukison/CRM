import { supabase } from '@/adapters/database/supabase.client';
import type { Invitation } from '@/types';


/**
 * Create a new organization invitation
 */
export async function createInvitation(
    orgId: string,
    email: string,
    role: 'admin' | 'member' | 'viewer'
): Promise<{ invitation: Invitation | null; error: Error | null }> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('org_invitations')
            .insert({
                org_id: orgId,
                email,
                role,
                invited_by: user.id,
            })
            .select()
            .single();

        if (error) throw error;
        return { invitation: data as Invitation, error: null };
    } catch (error) {
        return { invitation: null, error: error as Error };
    }
}

/**
 * Get all pending invitations for an organization
 */
export async function getOrgInvitations(orgId: string): Promise<{
    invitations: Invitation[];
    error: Error | null;
}> {
    try {
        const { data, error } = await supabase
            .from('org_invitations')
            .select('*')
            .eq('org_id', orgId)
            .is('accepted_at', null)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { invitations: data as Invitation[], error: null };
    } catch (error) {
        return { invitations: [], error: error as Error };
    }
}

/**
 * Accept an invitation and join the organization
 */
export async function acceptInvitation(token: string): Promise<{
    orgId: string | null;
    error: Error | null;
}> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Get invitation details
        const { data: invitation, error: inviteError } = await supabase
            .from('org_invitations')
            .select('*')
            .eq('token', token)
            .is('accepted_at', null)
            .single();

        if (inviteError) throw inviteError;
        if (!invitation) throw new Error('Invalid or expired invitation');

        // Check if invitation has expired
        if (new Date(invitation.expires_at) < new Date()) {
            throw new Error('Invitation has expired');
        }

        // Add user to organization
        const { error: memberError } = await supabase
            .from('org_members')
            .insert({
                org_id: invitation.org_id!,
                user_id: user.id,
                role: invitation.role,
            });

        if (memberError) throw memberError;

        // Mark invitation as accepted
        const { error: updateError } = await supabase
            .from('org_invitations')
            .update({ accepted_at: new Date().toISOString() })
            .eq('id', invitation.id);

        if (updateError) throw updateError;

        return { orgId: invitation.org_id!, error: null };
    } catch (error) {
        return { orgId: null, error: error as Error };
    }
}

/**
 * Revoke an invitation
 */
export async function revokeInvitation(inviteId: string): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase
            .from('org_invitations')
            .delete()
            .eq('id', inviteId);

        if (error) throw error;
        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}

/**
 * Validate an invitation token and get details
 */
export async function validateInvitationToken(token: string): Promise<{
    invitation: (Invitation & { org_name: string }) | null;
    error: Error | null;
}> {
    try {
        const { data, error } = await supabase
            .from('org_invitations')
            .select(`
                *,
                organization:org_id (
                    name
                )
            `)
            .eq('token', token)
            .is('accepted_at', null)
            .single();

        if (error) throw error;
        if (!data) throw new Error('Invalid invitation token');

        // Check if expired
        if (new Date(data.expires_at) < new Date()) {
            throw new Error('Invitation has expired');
        }

        return {
            invitation: {
                ...data,
                org_name: (data as any).organization?.name || '',
            } as Invitation & { org_name: string },
            error: null,
        };
    } catch (error) {
        return { invitation: null, error: error as Error };
    }
}
